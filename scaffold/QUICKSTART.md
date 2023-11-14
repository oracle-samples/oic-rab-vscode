# OIC Rapid Adapter Builder (RAB) Project

A RAB project is a resource bundle that holds everything for specific adapter's development. The extenstion will detect such structure and enable the workspace for various features.

## Project Structure

```shell
.
├── api                                <-- documents that describes the 3rd-party API like OpenAPI, Postman collection etc. (Optional)
│  └── app.postman_collection.json     <-- Postman collection must have suffix of '.postman_collection.json'
├── definitions                        <-- RAB definitions. Must have suffix of '.add.json'
│  └── main.add.json                   <-- The main adapter definition document for your adapter.
├── resources                          <-- resources like logo and i18n files.
   └── logo.svg
```

For more information, please check the documentations.

*You can safely delete this file.*
