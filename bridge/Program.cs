using System;
using Newtonsoft.Json;

namespace VbaBridge
{
    class Program
    {
        static int Main(string[] args)
        {
            string input = Console.In.ReadToEnd();
            BridgeResponse response;

            try
            {
                var request = JsonConvert.DeserializeObject<BridgeRequest>(input);
                if (request == null || string.IsNullOrEmpty(request.Command))
                {
                    response = new BridgeResponse
                    {
                        Ok = false,
                        Error = "Invalid request: missing command",
                        Code = "INVALID_REQUEST"
                    };
                }
                else
                {
                    var connector = new ExcelConnector();
                    switch (request.Command.ToLowerInvariant())
                    {
                        case "list":
                            response = connector.ListWorkbooks();
                            break;

                        case "pull":
                            if (string.IsNullOrEmpty(request.Workbook))
                            {
                                response = new BridgeResponse
                                {
                                    Ok = false,
                                    Error = "Missing workbook path",
                                    Code = "INVALID_REQUEST"
                                };
                            }
                            else
                            {
                                response = connector.PullModules(
                                    request.Workbook,
                                    request.OutDir ?? "."
                                );
                            }
                            break;

                        case "push":
                            if (string.IsNullOrEmpty(request.Workbook) || request.Modules == null)
                            {
                                response = new BridgeResponse
                                {
                                    Ok = false,
                                    Error = "Missing workbook path or modules",
                                    Code = "INVALID_REQUEST"
                                };
                            }
                            else
                            {
                                response = connector.PushModules(
                                    request.Workbook,
                                    request.Modules
                                );
                            }
                            break;

                        default:
                            response = new BridgeResponse
                            {
                                Ok = false,
                                Error = $"Unknown command: {request.Command}",
                                Code = "UNKNOWN_COMMAND"
                            };
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                response = new BridgeResponse
                {
                    Ok = false,
                    Error = ex.Message,
                    Code = "COM_ERROR"
                };
            }

            Console.Out.Write(JsonConvert.SerializeObject(response));
            return response.Ok ? 0 : 1;
        }
    }
}
