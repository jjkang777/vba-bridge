import { StubClass, StubMember } from './types';

export const excelClasses: StubClass[] = [
  {
    name: 'Application',
    description: 'Represents the entire Excel application.',
    members: [
      { name: 'ActiveCell', kind: 'property', returnType: 'Range', description: 'Returns the active cell.', readonly: true },
      { name: 'ActiveSheet', kind: 'property', returnType: 'Worksheet', description: 'Returns the active sheet.', readonly: true },
      { name: 'ActiveWorkbook', kind: 'property', returnType: 'Workbook', description: 'Returns the active workbook.', readonly: true },
      { name: 'Cells', kind: 'property', returnType: 'Range', description: 'Returns all cells on the active worksheet.', readonly: true },
      { name: 'Columns', kind: 'property', returnType: 'Range', description: 'Returns all columns on the active worksheet.', readonly: true },
      { name: 'Rows', kind: 'property', returnType: 'Range', description: 'Returns all rows on the active worksheet.', readonly: true },
      { name: 'Range', kind: 'property', returnType: 'Range', description: 'Returns a Range object on the active worksheet.', readonly: true },
      { name: 'Selection', kind: 'property', returnType: 'Object', description: 'Returns the currently selected object.', readonly: true },
      { name: 'StatusBar', kind: 'property', returnType: 'String', description: 'Gets or sets the status bar text.' },
      { name: 'ScreenUpdating', kind: 'property', returnType: 'Boolean', description: 'Controls whether screen updating is enabled.' },
      { name: 'DisplayAlerts', kind: 'property', returnType: 'Boolean', description: 'Controls whether alerts are displayed.' },
      { name: 'EnableEvents', kind: 'property', returnType: 'Boolean', description: 'Controls whether events are enabled.' },
      { name: 'Calculation', kind: 'property', returnType: 'XlCalculation', description: 'Gets or sets the calculation mode.' },
      { name: 'ThisWorkbook', kind: 'property', returnType: 'Workbook', description: 'Returns the workbook containing the running macro.', readonly: true },
      { name: 'Worksheets', kind: 'property', returnType: 'Worksheets', description: 'Returns the Worksheets collection for the active workbook.', readonly: true },
      { name: 'Workbooks', kind: 'property', returnType: 'Workbooks', description: 'Returns the Workbooks collection.', readonly: true },
      { name: 'Calculate', kind: 'method', returnType: 'Void', description: 'Calculates all open workbooks.' },
      { name: 'Run', kind: 'method', returnType: 'Variant', description: 'Runs a macro or calls a function.', parameters: [
        { name: 'Macro', type: 'String', description: 'The macro to run' },
      ] },
      { name: 'InputBox', kind: 'method', returnType: 'Variant', description: 'Displays an input box.', parameters: [
        { name: 'Prompt', type: 'String', description: 'The message to display' },
        { name: 'Title', type: 'String', optional: true, description: 'The dialog title' },
        { name: 'Default', type: 'Variant', optional: true, description: 'Default value' },
        { name: 'Type', type: 'Long', optional: true, description: 'Input type (0=formula, 1=number, 2=text, 8=range)' },
      ] },
      { name: 'Wait', kind: 'method', returnType: 'Boolean', description: 'Pauses until a specified time.', parameters: [
        { name: 'Time', type: 'Date', description: 'The time to wait until' },
      ] },
      { name: 'OnTime', kind: 'method', returnType: 'Void', description: 'Schedules a procedure to run at a specified time.', parameters: [
        { name: 'EarliestTime', type: 'Date', description: 'The earliest time to run' },
        { name: 'Procedure', type: 'String', description: 'The procedure to run' },
        { name: 'LatestTime', type: 'Date', optional: true, description: 'The latest time to run' },
        { name: 'Schedule', type: 'Boolean', optional: true, description: 'True to schedule, False to cancel' },
      ] },
    ],
  },
  {
    name: 'Workbook',
    description: 'Represents an Excel workbook.',
    members: [
      { name: 'Name', kind: 'property', returnType: 'String', description: 'Returns the workbook name.', readonly: true },
      { name: 'Path', kind: 'property', returnType: 'String', description: 'Returns the file path.', readonly: true },
      { name: 'FullName', kind: 'property', returnType: 'String', description: 'Returns the full file path including name.', readonly: true },
      { name: 'Sheets', kind: 'property', returnType: 'Sheets', description: 'Returns all sheets in the workbook.', readonly: true },
      { name: 'Worksheets', kind: 'property', returnType: 'Worksheets', description: 'Returns all worksheets in the workbook.', readonly: true },
      { name: 'ActiveSheet', kind: 'property', returnType: 'Worksheet', description: 'Returns the active sheet.', readonly: true },
      { name: 'Saved', kind: 'property', returnType: 'Boolean', description: 'True if no changes have been made since last save.' },
      { name: 'ReadOnly', kind: 'property', returnType: 'Boolean', description: 'True if the workbook is read-only.', readonly: true },
      { name: 'Save', kind: 'method', returnType: 'Void', description: 'Saves the workbook.' },
      { name: 'SaveAs', kind: 'method', returnType: 'Void', description: 'Saves the workbook with a new name.', parameters: [
        { name: 'Filename', type: 'String', optional: true, description: 'The file name' },
        { name: 'FileFormat', type: 'XlFileFormat', optional: true, description: 'The file format' },
      ] },
      { name: 'Close', kind: 'method', returnType: 'Void', description: 'Closes the workbook.', parameters: [
        { name: 'SaveChanges', type: 'Boolean', optional: true, description: 'Whether to save changes' },
      ] },
      { name: 'Activate', kind: 'method', returnType: 'Void', description: 'Activates the workbook.' },
      { name: 'Protect', kind: 'method', returnType: 'Void', description: 'Protects the workbook.', parameters: [
        { name: 'Password', type: 'String', optional: true, description: 'The password' },
      ] },
      { name: 'Unprotect', kind: 'method', returnType: 'Void', description: 'Unprotects the workbook.', parameters: [
        { name: 'Password', type: 'String', optional: true, description: 'The password' },
      ] },
    ],
  },
  {
    name: 'Workbooks',
    description: 'A collection of all open Workbook objects.',
    defaultMember: 'Item',
    members: [
      { name: 'Count', kind: 'property', returnType: 'Long', description: 'Returns the number of workbooks.', readonly: true },
      { name: 'Item', kind: 'property', returnType: 'Workbook', description: 'Returns a single workbook.', parameters: [
        { name: 'Index', type: 'Variant', description: 'The workbook name or index' },
      ] },
      { name: 'Add', kind: 'method', returnType: 'Workbook', description: 'Creates a new workbook.' },
      { name: 'Open', kind: 'method', returnType: 'Workbook', description: 'Opens a workbook.', parameters: [
        { name: 'Filename', type: 'String', description: 'The file to open' },
        { name: 'ReadOnly', type: 'Boolean', optional: true, description: 'Open as read-only' },
      ] },
      { name: 'Close', kind: 'method', returnType: 'Void', description: 'Closes all workbooks.' },
    ],
  },
  {
    name: 'Worksheet',
    description: 'Represents a worksheet.',
    members: [
      { name: 'Name', kind: 'property', returnType: 'String', description: 'Gets or sets the worksheet name.' },
      { name: 'Index', kind: 'property', returnType: 'Long', description: 'Returns the index number.', readonly: true },
      { name: 'Cells', kind: 'property', returnType: 'Range', description: 'Returns all cells on the worksheet.', readonly: true },
      { name: 'Range', kind: 'property', returnType: 'Range', description: 'Returns a Range object.', readonly: true, parameters: [
        { name: 'Cell1', type: 'Variant', description: 'The range address or top-left cell' },
        { name: 'Cell2', type: 'Variant', optional: true, description: 'The bottom-right cell' },
      ] },
      { name: 'Columns', kind: 'property', returnType: 'Range', description: 'Returns all columns.', readonly: true },
      { name: 'Rows', kind: 'property', returnType: 'Range', description: 'Returns all rows.', readonly: true },
      { name: 'UsedRange', kind: 'property', returnType: 'Range', description: 'Returns the used range.', readonly: true },
      { name: 'Visible', kind: 'property', returnType: 'XlSheetVisibility', description: 'Gets or sets the visibility.' },
      { name: 'Parent', kind: 'property', returnType: 'Workbook', description: 'Returns the parent workbook.', readonly: true },
      { name: 'CodeName', kind: 'property', returnType: 'String', description: 'Returns the code name.', readonly: true },
      { name: 'Activate', kind: 'method', returnType: 'Void', description: 'Activates the worksheet.' },
      { name: 'Copy', kind: 'method', returnType: 'Void', description: 'Copies the worksheet.', parameters: [
        { name: 'Before', type: 'Worksheet', optional: true, description: 'Sheet to copy before' },
        { name: 'After', type: 'Worksheet', optional: true, description: 'Sheet to copy after' },
      ] },
      { name: 'Delete', kind: 'method', returnType: 'Void', description: 'Deletes the worksheet.' },
      { name: 'Select', kind: 'method', returnType: 'Void', description: 'Selects the worksheet.' },
      { name: 'Calculate', kind: 'method', returnType: 'Void', description: 'Calculates the worksheet.' },
      { name: 'Protect', kind: 'method', returnType: 'Void', description: 'Protects the worksheet.', parameters: [
        { name: 'Password', type: 'String', optional: true, description: 'The password' },
      ] },
      { name: 'Unprotect', kind: 'method', returnType: 'Void', description: 'Unprotects the worksheet.', parameters: [
        { name: 'Password', type: 'String', optional: true, description: 'The password' },
      ] },
    ],
  },
  {
    name: 'Worksheets',
    description: 'A collection of all Worksheet objects.',
    defaultMember: 'Item',
    members: [
      { name: 'Count', kind: 'property', returnType: 'Long', description: 'Returns the number of worksheets.', readonly: true },
      { name: 'Item', kind: 'property', returnType: 'Worksheet', description: 'Returns a single worksheet.', parameters: [
        { name: 'Index', type: 'Variant', description: 'The worksheet name or index' },
      ] },
      { name: 'Add', kind: 'method', returnType: 'Worksheet', description: 'Adds a new worksheet.', parameters: [
        { name: 'Before', type: 'Worksheet', optional: true, description: 'Sheet to add before' },
        { name: 'After', type: 'Worksheet', optional: true, description: 'Sheet to add after' },
        { name: 'Count', type: 'Long', optional: true, description: 'Number of sheets to add' },
      ] },
    ],
  },
  {
    name: 'Range',
    description: 'Represents a cell, a row, a column, or a selection of cells.',
    defaultMember: 'Value',
    members: [
      { name: 'Value', kind: 'property', returnType: 'Variant', description: 'Gets or sets the cell value.' },
      { name: 'Value2', kind: 'property', returnType: 'Variant', description: 'Gets or sets the cell value (no Date/Currency formatting).' },
      { name: 'Text', kind: 'property', returnType: 'String', description: 'Returns the formatted text.', readonly: true },
      { name: 'Formula', kind: 'property', returnType: 'Variant', description: 'Gets or sets the formula in A1 notation.' },
      { name: 'FormulaR1C1', kind: 'property', returnType: 'Variant', description: 'Gets or sets the formula in R1C1 notation.' },
      { name: 'Address', kind: 'property', returnType: 'String', description: 'Returns the range address.', readonly: true },
      { name: 'Row', kind: 'property', returnType: 'Long', description: 'Returns the first row number.', readonly: true },
      { name: 'Column', kind: 'property', returnType: 'Long', description: 'Returns the first column number.', readonly: true },
      { name: 'Rows', kind: 'property', returnType: 'Range', description: 'Returns the rows in the range.', readonly: true },
      { name: 'Columns', kind: 'property', returnType: 'Range', description: 'Returns the columns in the range.', readonly: true },
      { name: 'Cells', kind: 'property', returnType: 'Range', description: 'Returns cells in the range.', readonly: true },
      { name: 'Count', kind: 'property', returnType: 'Long', description: 'Returns the number of cells.', readonly: true },
      { name: 'Offset', kind: 'property', returnType: 'Range', description: 'Returns a range offset from this range.', parameters: [
        { name: 'RowOffset', type: 'Long', optional: true, description: 'Rows to offset' },
        { name: 'ColumnOffset', type: 'Long', optional: true, description: 'Columns to offset' },
      ] },
      { name: 'Resize', kind: 'property', returnType: 'Range', description: 'Resizes the range.', parameters: [
        { name: 'RowSize', type: 'Long', optional: true, description: 'New row count' },
        { name: 'ColumnSize', type: 'Long', optional: true, description: 'New column count' },
      ] },
      { name: 'End', kind: 'property', returnType: 'Range', description: 'Returns the end cell in a direction.', parameters: [
        { name: 'Direction', type: 'XlDirection', description: 'The direction (xlUp, xlDown, xlToLeft, xlToRight)' },
      ] },
      { name: 'EntireRow', kind: 'property', returnType: 'Range', description: 'Returns the entire row(s).', readonly: true },
      { name: 'EntireColumn', kind: 'property', returnType: 'Range', description: 'Returns the entire column(s).', readonly: true },
      { name: 'Font', kind: 'property', returnType: 'Font', description: 'Returns the Font object.', readonly: true },
      { name: 'Interior', kind: 'property', returnType: 'Interior', description: 'Returns the Interior object.', readonly: true },
      { name: 'NumberFormat', kind: 'property', returnType: 'Variant', description: 'Gets or sets the number format.' },
      { name: 'HorizontalAlignment', kind: 'property', returnType: 'Variant', description: 'Gets or sets horizontal alignment.' },
      { name: 'VerticalAlignment', kind: 'property', returnType: 'Variant', description: 'Gets or sets vertical alignment.' },
      { name: 'WrapText', kind: 'property', returnType: 'Boolean', description: 'Gets or sets text wrapping.' },
      { name: 'MergeCells', kind: 'property', returnType: 'Variant', description: 'True if the range is merged.' },
      { name: 'ColumnWidth', kind: 'property', returnType: 'Double', description: 'Gets or sets the column width.' },
      { name: 'RowHeight', kind: 'property', returnType: 'Double', description: 'Gets or sets the row height.' },
      { name: 'Worksheet', kind: 'property', returnType: 'Worksheet', description: 'Returns the parent worksheet.', readonly: true },
      { name: 'Select', kind: 'method', returnType: 'Void', description: 'Selects the range.' },
      { name: 'Copy', kind: 'method', returnType: 'Void', description: 'Copies the range.', parameters: [
        { name: 'Destination', type: 'Range', optional: true, description: 'The paste destination' },
      ] },
      { name: 'Cut', kind: 'method', returnType: 'Void', description: 'Cuts the range.', parameters: [
        { name: 'Destination', type: 'Range', optional: true, description: 'The paste destination' },
      ] },
      { name: 'Delete', kind: 'method', returnType: 'Void', description: 'Deletes the range.', parameters: [
        { name: 'Shift', type: 'XlDeleteShiftDirection', optional: true, description: 'Shift direction' },
      ] },
      { name: 'Insert', kind: 'method', returnType: 'Void', description: 'Inserts cells.', parameters: [
        { name: 'Shift', type: 'XlInsertShiftDirection', optional: true, description: 'Shift direction' },
      ] },
      { name: 'Clear', kind: 'method', returnType: 'Void', description: 'Clears the range.' },
      { name: 'ClearContents', kind: 'method', returnType: 'Void', description: 'Clears contents only.' },
      { name: 'ClearFormats', kind: 'method', returnType: 'Void', description: 'Clears formats only.' },
      { name: 'AutoFill', kind: 'method', returnType: 'Void', description: 'Auto-fills the range.', parameters: [
        { name: 'Destination', type: 'Range', description: 'The fill destination' },
        { name: 'Type', type: 'XlAutoFillType', optional: true, description: 'Fill type' },
      ] },
      { name: 'AutoFilter', kind: 'method', returnType: 'Void', description: 'Filters a list using AutoFilter.', parameters: [
        { name: 'Field', type: 'Long', optional: true, description: 'The field offset' },
        { name: 'Criteria1', type: 'Variant', optional: true, description: 'First criteria' },
      ] },
      { name: 'Sort', kind: 'method', returnType: 'Void', description: 'Sorts the range.', parameters: [
        { name: 'Key1', type: 'Range', optional: true, description: 'First sort key' },
        { name: 'Order1', type: 'XlSortOrder', optional: true, description: 'Sort order' },
      ] },
      { name: 'Find', kind: 'method', returnType: 'Range', description: 'Finds a value in the range.', parameters: [
        { name: 'What', type: 'Variant', description: 'The value to find' },
        { name: 'After', type: 'Range', optional: true, description: 'Cell to search after' },
        { name: 'LookIn', type: 'XlFindLookIn', optional: true, description: 'Where to look' },
        { name: 'LookAt', type: 'XlLookAt', optional: true, description: 'Match whole or part' },
      ] },
      { name: 'FindNext', kind: 'method', returnType: 'Range', description: 'Continues a Find search.', parameters: [
        { name: 'After', type: 'Range', optional: true, description: 'Cell to search after' },
      ] },
      { name: 'Replace', kind: 'method', returnType: 'Boolean', description: 'Replaces values.', parameters: [
        { name: 'What', type: 'Variant', description: 'Value to find' },
        { name: 'Replacement', type: 'Variant', description: 'Replacement value' },
      ] },
      { name: 'Merge', kind: 'method', returnType: 'Void', description: 'Merges cells.' },
      { name: 'UnMerge', kind: 'method', returnType: 'Void', description: 'Unmerges cells.' },
      { name: 'SpecialCells', kind: 'method', returnType: 'Range', description: 'Returns special cells.', parameters: [
        { name: 'Type', type: 'XlCellType', description: 'The type of special cells' },
        { name: 'Value', type: 'XlSpecialCellsValue', optional: true, description: 'Additional filter' },
      ] },
    ],
  },
  {
    name: 'Font',
    description: 'Represents the font attributes of an object.',
    members: [
      { name: 'Name', kind: 'property', returnType: 'String', description: 'Gets or sets the font name.' },
      { name: 'Size', kind: 'property', returnType: 'Double', description: 'Gets or sets the font size.' },
      { name: 'Bold', kind: 'property', returnType: 'Boolean', description: 'Gets or sets bold.' },
      { name: 'Italic', kind: 'property', returnType: 'Boolean', description: 'Gets or sets italic.' },
      { name: 'Underline', kind: 'property', returnType: 'XlUnderlineStyle', description: 'Gets or sets underline style.' },
      { name: 'Color', kind: 'property', returnType: 'Long', description: 'Gets or sets the font color.' },
      { name: 'ColorIndex', kind: 'property', returnType: 'Long', description: 'Gets or sets the color index.' },
      { name: 'Strikethrough', kind: 'property', returnType: 'Boolean', description: 'Gets or sets strikethrough.' },
    ],
  },
  {
    name: 'Interior',
    description: 'Represents the interior (background) of an object.',
    members: [
      { name: 'Color', kind: 'property', returnType: 'Long', description: 'Gets or sets the fill color.' },
      { name: 'ColorIndex', kind: 'property', returnType: 'Long', description: 'Gets or sets the color index.' },
      { name: 'Pattern', kind: 'property', returnType: 'XlPattern', description: 'Gets or sets the fill pattern.' },
      { name: 'PatternColor', kind: 'property', returnType: 'Long', description: 'Gets or sets the pattern color.' },
    ],
  },
];

export const globalFunctions: StubMember[] = [
  { name: 'MsgBox', kind: 'method', returnType: 'VbMsgBoxResult', description: 'Displays a message box and returns the button clicked.', parameters: [
    { name: 'Prompt', type: 'String', description: 'The message text' },
    { name: 'Buttons', type: 'VbMsgBoxStyle', optional: true, description: 'Button configuration' },
    { name: 'Title', type: 'String', optional: true, description: 'The dialog title' },
  ] },
  { name: 'InputBox', kind: 'method', returnType: 'String', description: 'Displays an input box and returns the entered text.', parameters: [
    { name: 'Prompt', type: 'String', description: 'The message text' },
    { name: 'Title', type: 'String', optional: true, description: 'The dialog title' },
    { name: 'Default', type: 'String', optional: true, description: 'Default value' },
  ] },
  { name: 'Format', kind: 'method', returnType: 'String', description: 'Formats an expression.', parameters: [
    { name: 'Expression', type: 'Variant', description: 'The expression to format' },
    { name: 'Format', type: 'String', optional: true, description: 'Format string' },
  ] },
  { name: 'Left', kind: 'method', returnType: 'String', description: 'Returns characters from the left side of a string.', parameters: [
    { name: 'String', type: 'String' }, { name: 'Length', type: 'Long' },
  ] },
  { name: 'Right', kind: 'method', returnType: 'String', description: 'Returns characters from the right side of a string.', parameters: [
    { name: 'String', type: 'String' }, { name: 'Length', type: 'Long' },
  ] },
  { name: 'Mid', kind: 'method', returnType: 'String', description: 'Returns a substring.', parameters: [
    { name: 'String', type: 'String' }, { name: 'Start', type: 'Long' }, { name: 'Length', type: 'Long', optional: true },
  ] },
  { name: 'Len', kind: 'method', returnType: 'Long', description: 'Returns the length of a string.', parameters: [
    { name: 'String', type: 'String' },
  ] },
  { name: 'Trim', kind: 'method', returnType: 'String', description: 'Removes leading and trailing spaces.', parameters: [{ name: 'String', type: 'String' }] },
  { name: 'LTrim', kind: 'method', returnType: 'String', description: 'Removes leading spaces.', parameters: [{ name: 'String', type: 'String' }] },
  { name: 'RTrim', kind: 'method', returnType: 'String', description: 'Removes trailing spaces.', parameters: [{ name: 'String', type: 'String' }] },
  { name: 'UCase', kind: 'method', returnType: 'String', description: 'Converts to uppercase.', parameters: [{ name: 'String', type: 'String' }] },
  { name: 'LCase', kind: 'method', returnType: 'String', description: 'Converts to lowercase.', parameters: [{ name: 'String', type: 'String' }] },
  { name: 'InStr', kind: 'method', returnType: 'Long', description: 'Returns the position of a substring.', parameters: [
    { name: 'Start', type: 'Long', optional: true }, { name: 'String1', type: 'String' },
    { name: 'String2', type: 'String' }, { name: 'Compare', type: 'VbCompareMethod', optional: true },
  ] },
  { name: 'Replace', kind: 'method', returnType: 'String', description: 'Replaces occurrences of a substring.', parameters: [
    { name: 'Expression', type: 'String' }, { name: 'Find', type: 'String' }, { name: 'Replace', type: 'String' },
    { name: 'Start', type: 'Long', optional: true }, { name: 'Count', type: 'Long', optional: true },
  ] },
  { name: 'Split', kind: 'method', returnType: 'String()', description: 'Splits a string into an array.', parameters: [
    { name: 'Expression', type: 'String' }, { name: 'Delimiter', type: 'String', optional: true },
    { name: 'Limit', type: 'Long', optional: true },
  ] },
  { name: 'Join', kind: 'method', returnType: 'String', description: 'Joins an array into a string.', parameters: [
    { name: 'SourceArray', type: 'Variant' }, { name: 'Delimiter', type: 'String', optional: true },
  ] },
  { name: 'IsEmpty', kind: 'method', returnType: 'Boolean', description: 'Returns True if the variable is empty.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'IsNull', kind: 'method', returnType: 'Boolean', description: 'Returns True if the expression is Null.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'IsNumeric', kind: 'method', returnType: 'Boolean', description: 'Returns True if the expression is numeric.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'IsDate', kind: 'method', returnType: 'Boolean', description: 'Returns True if the expression is a date.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'IsArray', kind: 'method', returnType: 'Boolean', description: 'Returns True if the variable is an array.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'IsObject', kind: 'method', returnType: 'Boolean', description: 'Returns True if the expression is an object.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'CStr', kind: 'method', returnType: 'String', description: 'Converts to String.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'CInt', kind: 'method', returnType: 'Integer', description: 'Converts to Integer.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'CLng', kind: 'method', returnType: 'Long', description: 'Converts to Long.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'CDbl', kind: 'method', returnType: 'Double', description: 'Converts to Double.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'CDate', kind: 'method', returnType: 'Date', description: 'Converts to Date.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'CBool', kind: 'method', returnType: 'Boolean', description: 'Converts to Boolean.', parameters: [{ name: 'Expression', type: 'Variant' }] },
  { name: 'Val', kind: 'method', returnType: 'Double', description: 'Returns the numeric value of a string.', parameters: [{ name: 'String', type: 'String' }] },
  { name: 'Int', kind: 'method', returnType: 'Long', description: 'Returns the integer portion.', parameters: [{ name: 'Number', type: 'Double' }] },
  { name: 'Fix', kind: 'method', returnType: 'Long', description: 'Returns the integer portion (truncates toward zero).', parameters: [{ name: 'Number', type: 'Double' }] },
  { name: 'Abs', kind: 'method', returnType: 'Double', description: 'Returns the absolute value.', parameters: [{ name: 'Number', type: 'Double' }] },
  { name: 'Round', kind: 'method', returnType: 'Double', description: 'Rounds a number.', parameters: [
    { name: 'Number', type: 'Double' }, { name: 'NumDigitsAfterDecimal', type: 'Long', optional: true },
  ] },
  { name: 'Sgn', kind: 'method', returnType: 'Long', description: 'Returns the sign of a number.', parameters: [{ name: 'Number', type: 'Double' }] },
  { name: 'Sqr', kind: 'method', returnType: 'Double', description: 'Returns the square root.', parameters: [{ name: 'Number', type: 'Double' }] },
  { name: 'Now', kind: 'method', returnType: 'Date', description: 'Returns the current date and time.' },
  { name: 'Date', kind: 'method', returnType: 'Date', description: 'Returns the current date.' },
  { name: 'Time', kind: 'method', returnType: 'Date', description: 'Returns the current time.' },
  { name: 'Timer', kind: 'method', returnType: 'Single', description: 'Returns seconds elapsed since midnight.' },
  { name: 'Year', kind: 'method', returnType: 'Integer', description: 'Returns the year.', parameters: [{ name: 'Date', type: 'Date' }] },
  { name: 'Month', kind: 'method', returnType: 'Integer', description: 'Returns the month.', parameters: [{ name: 'Date', type: 'Date' }] },
  { name: 'Day', kind: 'method', returnType: 'Integer', description: 'Returns the day.', parameters: [{ name: 'Date', type: 'Date' }] },
  { name: 'Hour', kind: 'method', returnType: 'Integer', description: 'Returns the hour.', parameters: [{ name: 'Time', type: 'Date' }] },
  { name: 'Minute', kind: 'method', returnType: 'Integer', description: 'Returns the minute.', parameters: [{ name: 'Time', type: 'Date' }] },
  { name: 'Second', kind: 'method', returnType: 'Integer', description: 'Returns the second.', parameters: [{ name: 'Time', type: 'Date' }] },
  { name: 'DateSerial', kind: 'method', returnType: 'Date', description: 'Returns a Date for a given year, month, and day.', parameters: [
    { name: 'Year', type: 'Integer' }, { name: 'Month', type: 'Integer' }, { name: 'Day', type: 'Integer' },
  ] },
  { name: 'DateAdd', kind: 'method', returnType: 'Date', description: 'Adds a time interval to a date.', parameters: [
    { name: 'Interval', type: 'String' }, { name: 'Number', type: 'Long' }, { name: 'Date', type: 'Date' },
  ] },
  { name: 'DateDiff', kind: 'method', returnType: 'Long', description: 'Returns the difference between two dates.', parameters: [
    { name: 'Interval', type: 'String' }, { name: 'Date1', type: 'Date' }, { name: 'Date2', type: 'Date' },
  ] },
  { name: 'Array', kind: 'method', returnType: 'Variant', description: 'Creates an array from a list of values.' },
  { name: 'UBound', kind: 'method', returnType: 'Long', description: 'Returns the upper bound of an array.', parameters: [
    { name: 'Array', type: 'Variant' }, { name: 'Dimension', type: 'Long', optional: true },
  ] },
  { name: 'LBound', kind: 'method', returnType: 'Long', description: 'Returns the lower bound of an array.', parameters: [
    { name: 'Array', type: 'Variant' }, { name: 'Dimension', type: 'Long', optional: true },
  ] },
  { name: 'Asc', kind: 'method', returnType: 'Integer', description: 'Returns the character code.', parameters: [{ name: 'String', type: 'String' }] },
  { name: 'Chr', kind: 'method', returnType: 'String', description: 'Returns the character for a code.', parameters: [{ name: 'CharCode', type: 'Integer' }] },
  { name: 'Space', kind: 'method', returnType: 'String', description: 'Returns a string of spaces.', parameters: [{ name: 'Number', type: 'Long' }] },
  { name: 'String', kind: 'method', returnType: 'String', description: 'Returns a repeating character string.', parameters: [
    { name: 'Number', type: 'Long' }, { name: 'Character', type: 'Variant' },
  ] },
];
