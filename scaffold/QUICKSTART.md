# OIC Rapid Adapter Builder (RAB) Workspace

The workspace represents a RAB bundle that holds everything for specific adapter's development. RAB extenstion will detect such structure and enable the workspace for various features.

To generate RAB bundle, use `RAB: Create RAB Bundle` command.

## Workspace Structure

```shell
.
├── api                                <-- Folder that contains machine-readable documents for describing the 3rd-party API. Currently supports OpenAPI.
│  └── openapi.resource.json           <-- OpenAPI document must be named to 'openapi.resource.json' (Optional)
├── definitions                        <-- Folder that contains the adapter definitions.
│  └── main.add.json                   <-- The main adapter definition document must be named 'main.add.json'.
├── misc                               <-- Folder that contains intermediate resources which will not be persisted in OIC.
│  └── app.postman_collection.json     <-- Postman collection must have suffix of '.postman_collection.json' (Optional)
└── logo.svg                           <-- The logo file for the adapter. Must be SVG format. (Optional)
```

For more information, please check out the quick-start guide [here](https://www.oracle.com/pls/topic/lookup?ctx=appint&id=ICRAB).

Full documentation is available [here](https://www.oracle.com/pls/topic/lookup?ctx=appint&id=ICNAB).

*You can safely delete this file.*
