using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using Microsoft.Office.Interop.Excel;
using Microsoft.Vbe.Interop;

namespace VbaBridge
{
    public class ExcelConnector
    {
        // VBComponent types
        private const int VbextCtStdModule = 1;
        private const int VbextCtClassModule = 2;
        private const int VbextCtMsForm = 3;
        private const int VbextCtDocument = 100;

        public ListResponse ListWorkbooks()
        {
            Application app = null;
            try
            {
                app = (Application)Marshal.GetActiveObject("Excel.Application");
            }
            catch (COMException)
            {
                return new ListResponse
                {
                    Ok = false,
                    Error = "Excel is not running. Please open Excel first.",
                    Code = "EXCEL_NOT_FOUND"
                };
            }

            try
            {
                var workbooks = new List<WorkbookInfo>();
                foreach (Workbook wb in app.Workbooks)
                {
                    workbooks.Add(new WorkbookInfo
                    {
                        Name = wb.Name,
                        Path = wb.FullName
                    });
                    Marshal.ReleaseComObject(wb);
                }

                return new ListResponse
                {
                    Ok = true,
                    Workbooks = workbooks.ToArray()
                };
            }
            finally
            {
                if (app != null) Marshal.ReleaseComObject(app);
            }
        }

        public PullResponse PullModules(string workbookPath, string outDir)
        {
            Application app = null;
            try
            {
                app = (Application)Marshal.GetActiveObject("Excel.Application");
            }
            catch (COMException)
            {
                return new PullResponse
                {
                    Ok = false,
                    Error = "Excel is not running. Please open Excel first.",
                    Code = "EXCEL_NOT_FOUND"
                };
            }

            Workbook targetWb = null;
            try
            {
                targetWb = FindWorkbook(app, workbookPath);
                if (targetWb == null)
                {
                    return new PullResponse
                    {
                        Ok = false,
                        Error = $"Workbook not found: {workbookPath}",
                        Code = "WORKBOOK_NOT_FOUND"
                    };
                }

                VBProject project;
                try
                {
                    project = targetWb.VBProject;
                }
                catch (COMException)
                {
                    return new PullResponse
                    {
                        Ok = false,
                        Error = "Cannot access VBA project. Please enable 'Trust access to the VBA project object model' in Excel Trust Center Settings > Macro Settings.",
                        Code = "TRUST_ACCESS_DISABLED"
                    };
                }

                if (!Directory.Exists(outDir))
                {
                    Directory.CreateDirectory(outDir);
                }

                var modules = new List<ModuleInfo>();
                foreach (VBComponent component in project.VBComponents)
                {
                    string typeName;
                    string extension;
                    switch ((int)component.Type)
                    {
                        case VbextCtStdModule:
                            typeName = "standard";
                            extension = ".bas";
                            break;
                        case VbextCtClassModule:
                            typeName = "class";
                            extension = ".cls";
                            break;
                        case VbextCtDocument:
                            typeName = "document";
                            extension = ".cls";
                            break;
                        case VbextCtMsForm:
                            typeName = "form";
                            extension = ".frm";
                            break;
                        default:
                            typeName = "unknown";
                            extension = ".bas";
                            break;
                    }

                    string code = "";
                    if (component.CodeModule.CountOfLines > 0)
                    {
                        code = component.CodeModule.get_Lines(1, component.CodeModule.CountOfLines);
                    }

                    string fileName = component.Name + extension;
                    string filePath = Path.Combine(outDir, fileName);
                    File.WriteAllText(filePath, code);

                    modules.Add(new ModuleInfo
                    {
                        Name = component.Name,
                        Type = typeName,
                        File = filePath
                    });

                    Marshal.ReleaseComObject(component);
                }

                Marshal.ReleaseComObject(project);

                return new PullResponse
                {
                    Ok = true,
                    Modules = modules.ToArray()
                };
            }
            finally
            {
                if (targetWb != null) Marshal.ReleaseComObject(targetWb);
                if (app != null) Marshal.ReleaseComObject(app);
            }
        }

        public PushResponse PushModules(string workbookPath, string[] modulePaths)
        {
            Application app = null;
            try
            {
                app = (Application)Marshal.GetActiveObject("Excel.Application");
            }
            catch (COMException)
            {
                return new PushResponse
                {
                    Ok = false,
                    Error = "Excel is not running. Please open Excel first.",
                    Code = "EXCEL_NOT_FOUND"
                };
            }

            Workbook targetWb = null;
            try
            {
                targetWb = FindWorkbook(app, workbookPath);
                if (targetWb == null)
                {
                    return new PushResponse
                    {
                        Ok = false,
                        Error = $"Workbook not found: {workbookPath}",
                        Code = "WORKBOOK_NOT_FOUND"
                    };
                }

                VBProject project;
                try
                {
                    project = targetWb.VBProject;
                }
                catch (COMException)
                {
                    return new PushResponse
                    {
                        Ok = false,
                        Error = "Cannot access VBA project. Please enable 'Trust access to the VBA project object model' in Excel Trust Center Settings > Macro Settings.",
                        Code = "TRUST_ACCESS_DISABLED"
                    };
                }

                int pushedCount = 0;

                foreach (string modulePath in modulePaths)
                {
                    if (!File.Exists(modulePath))
                    {
                        continue;
                    }

                    string code = File.ReadAllText(modulePath);
                    string moduleName = Path.GetFileNameWithoutExtension(modulePath);
                    string extension = Path.GetExtension(modulePath).ToLowerInvariant();

                    VBComponent existing = FindComponent(project, moduleName);

                    if (existing != null)
                    {
                        // Clear existing code and insert new code
                        CodeModule codeModule = existing.CodeModule;
                        if (codeModule.CountOfLines > 0)
                        {
                            codeModule.DeleteLines(1, codeModule.CountOfLines);
                        }
                        if (!string.IsNullOrEmpty(code))
                        {
                            codeModule.InsertLines(1, code);
                        }
                        Marshal.ReleaseComObject(codeModule);
                        Marshal.ReleaseComObject(existing);
                    }
                    else
                    {
                        // Add new component
                        vbext_ComponentType componentType;
                        if (extension == ".bas")
                        {
                            componentType = vbext_ComponentType.vbext_ct_StdModule;
                        }
                        else if (extension == ".cls")
                        {
                            componentType = vbext_ComponentType.vbext_ct_ClassModule;
                        }
                        else
                        {
                            continue; // Skip unsupported types
                        }

                        VBComponent newComponent = project.VBComponents.Add(componentType);
                        newComponent.Name = moduleName;
                        if (!string.IsNullOrEmpty(code))
                        {
                            newComponent.CodeModule.InsertLines(1, code);
                        }
                        Marshal.ReleaseComObject(newComponent);
                    }

                    pushedCount++;
                }

                Marshal.ReleaseComObject(project);

                return new PushResponse
                {
                    Ok = true,
                    Pushed = pushedCount
                };
            }
            finally
            {
                if (targetWb != null) Marshal.ReleaseComObject(targetWb);
                if (app != null) Marshal.ReleaseComObject(app);
            }
        }

        private Workbook FindWorkbook(Application app, string path)
        {
            string normalizedPath = Path.GetFullPath(path);
            foreach (Workbook wb in app.Workbooks)
            {
                bool match = string.Equals(
                    Path.GetFullPath(wb.FullName),
                    normalizedPath,
                    StringComparison.OrdinalIgnoreCase
                );
                if (match)
                {
                    return wb;
                }
                Marshal.ReleaseComObject(wb);
            }
            return null;
        }

        private VBComponent FindComponent(VBProject project, string name)
        {
            foreach (VBComponent component in project.VBComponents)
            {
                if (string.Equals(component.Name, name, StringComparison.OrdinalIgnoreCase))
                {
                    return component;
                }
                Marshal.ReleaseComObject(component);
            }
            return null;
        }
    }
}
