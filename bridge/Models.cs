using Newtonsoft.Json;

namespace VbaBridge
{
    public class BridgeRequest
    {
        [JsonProperty("command")]
        public string Command { get; set; }

        [JsonProperty("workbook")]
        public string Workbook { get; set; }

        [JsonProperty("outDir")]
        public string OutDir { get; set; }

        [JsonProperty("modules")]
        public string[] Modules { get; set; }
    }

    public class BridgeResponse
    {
        [JsonProperty("ok")]
        public bool Ok { get; set; }

        [JsonProperty("error", NullValueHandling = NullValueHandling.Ignore)]
        public string Error { get; set; }

        [JsonProperty("code", NullValueHandling = NullValueHandling.Ignore)]
        public string Code { get; set; }
    }

    public class ListResponse : BridgeResponse
    {
        [JsonProperty("workbooks")]
        public WorkbookInfo[] Workbooks { get; set; }
    }

    public class WorkbookInfo
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("path")]
        public string Path { get; set; }
    }

    public class PullResponse : BridgeResponse
    {
        [JsonProperty("modules")]
        public ModuleInfo[] Modules { get; set; }
    }

    public class ModuleInfo
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("file")]
        public string File { get; set; }
    }

    public class PushResponse : BridgeResponse
    {
        [JsonProperty("pushed")]
        public int Pushed { get; set; }
    }
}
