/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export namespace SharedNs {
  export const ADDJsonStringify = (add: any) => JSON.stringify(add, null, 2);
  export const WebviewCommandEnum = {
    webviewRouterReady: 'webviewRouterReady' as 'webviewRouterReady',
    webviewLifecycle: 'webviewLifecycle' as 'webviewLifecycle',

    postmanSelectRequests: 'postmanSelectRequests' as 'postmanSelectRequests',
    postmanDoneConvertDocument: 'postmanDoneConvertDocument' as 'postmanDoneConvertDocument',
    postmanSelectReady: 'postmanSelectReady' as 'postmanSelectReady',

    openAPISelectRequests: 'openAPISelectRequests' as 'openAPISelectRequests',
    openAPISelectReady: 'openAPISelectReady' as 'openAPISelectReady',
    openAPIDoneConvertDocument: 'openAPIDoneConvertDocument' as 'openAPIDoneConvertDocument',

    rabAddReady: 'rabAddReady' as 'rabAddReady',

    rabAddSave: 'rabAddSave' as 'rabAddSave',

  }
  export const ExtensionCommandEnum = {
    openCopilotPostmanConvert: 'orab.webview.copilot.open.postman.convert' as 'openCopilotPostmanConvert',
    openPostmanConvertConverDocument: 'orab.convert.postman.document' as 'openPostmanConvertConverDocument',
    openOpenAPIConvertNewDocument: 'orab.add.convert' as 'openOpenAPIConvertNewDocument',
    openOpenAPIConvertAppendDocument: 'orab.add.convert.append' as 'openOpenAPIConvertAppendDocument',
    openCopilotAssistant: 'orab.webview.copilot.open.assistant' as 'openCopilotAssistant',
    updatePostmanRawData: 'updatePostmanRawData' as 'updatePostmanRawData',
    updateOpenAPIRawData: 'updateOpenAPIRawData' as 'updateOpenAPIRawData',
    updateEntryType: 'updateEntryType' as 'updateEntryType',
    loadRabAddData: 'loadRabAddData' as 'loadRabAddData',
    routerNavigateTo: 'routerNavigateTo' as 'routerNavigateTo',
  }

  export enum WebviewRouteEnum {
    Root = `/`,
    PostmanAdd = `postman/add`,
    OpenAPIAdd = `openapi/add`,
    Copilot = `copilot`,

  }

  export interface WebviewCommandPayloadWebviewRouterReady {
    isReady: boolean;
  }

  export interface WebviewCommandPayloadPostmanSelectRequests {
    items: string[];
    selectedItemForTestConnection?: string;
  }
  export type WebviewCommandPayloadOpenAPISelectRequests = OpenAPINS.UIStateForBackend
  export interface WebviewCommandPayloadRabAddSave {
    addToSave: RabAddNs.Root;
    vsCodeEditorConfig?: VsCoderEditorConfig;
  }

  export type WebviewCommandPayload = {
    webviewRouterReady: WebviewCommandPayloadWebviewRouterReady;
    webviewLifecycle: {
      type: 'close'
    };

    postmanSelectRequests: Omit<WebviewCommandPayloadPostmanSelectRequests, "selectedItemForTestConnection">;
    postmanDoneConvertDocument: WebviewCommandPayloadPostmanSelectRequests;
    postmanSelectReady: any;

    openAPISelectRequests: WebviewCommandPayloadOpenAPISelectRequests;
    openAPIDoneConvertDocument: WebviewCommandPayloadOpenAPISelectRequests;
    openAPISelectReady: any;
    
    rabAddReady: any;

    rabAddSave: WebviewCommandPayloadRabAddSave;
  }

  export enum VscodeCommandPayloadEntryType {
    PostmanConvertDocument = `PostmanConvertDocument`,
    PostmanAddRequest = `PostmanAddRequest`,
    OpenAPIConvertDocument = `OpenAPIConvertDocument`,
    OpenAPIAddRequest = `OpenAPIAddRequest`,
  }

  export type VscodeCommandPayload = {
    openCopilotPostmanConvert: any;
    openCopilotAssistant: any;

    updatePostmanRawData: PostmanNs.Root;
    updateOpenAPIRawData: {
      openapi: OpenAPINS.Root,
      add?: RabAddNs.Root,
    };

    updateEntryType: VscodeCommandPayloadEntryType;

    openPostmanConvertConverDocument: any;

    openOpenAPIConvertNewDocument: any;
    openOpenAPIConvertAppendDocument: any;
    
    loadRabAddData: RabAddNs.Root;
    routerNavigateTo: {
      href: WebviewRouteEnum;
    };

  }

  export interface VsCoderEditorConfig {
    documentString: string,
    startTextPattern: string,
    endTextPattern?: string,
    startOffset?: number,
    endOffset?: number
  }

}

export namespace RabAddUtilNs {
  export const flowPrefix = `flow:`

  export interface RabAddDefinition {
    editorConfig?: SharedNs.VsCoderEditorConfig;
    add: RabAddNs.Root;
    addString: string;
  }
}

export namespace RabAddNs {

  export interface Root {
    info: Info
    connection: Connection
    categories: Categories
    schemas: Schemas
    actions: Actions
    triggers: Triggers
    flows: Flows
  }

  export interface Info {
    id: string
    displayName: string
    description: string
    version: string
    schemaVersion: string
    categories: string[]
    appInfo: AppInfo
    publisherInfo: PublisherInfo
    settings: Settings
  }

  export interface AppInfo {
    name: string
    description: string
    contactUS: string
    supportURL: string
    documentationURL: string

  }

  export interface PublisherInfo {
    name: string
    description: string
    contactUS: string
    supportURL: string
    documentationURL: string

  }

  export interface Settings {
    supportsAction: boolean
    supportsTrigger: boolean
    supportsConnectivityAgent: boolean
  }

  export interface Connection {
    connectionProperties: any[]
    securityPolicies: SecurityPolicy[]
    test?: string
  }

  export interface SecurityPolicy {
    type: string
    policy: string
    description: string
    displayName: string
    scope: string
    securityProperties?: SecurityProperty[]
  }

  export interface SecurityProperty {
    name: string
    displayName: string
    description: string
    shortDescription: string
    hidden: boolean
    required: boolean
    fixed?: string
  }

  export interface Categories {
    displayName: string
    description: string
    groups: Group[]
  }

  export interface Group {
    name: string
    displayName: string
    description: string
  }

  export interface Schemas {
    [key: string]: StaticInputField
  }

  export interface StaticInputField {
    type?: string
    format?: string
    allOf?: any[]
    items?: StaticInputField

    properties?: {
      [key: string]: StaticInputField
    }

    $ref?: string

  }


  export interface StaticOutput {
    type: string
    properties: Properties2
  }

  export interface Properties2 {
    static_output_field_1: StaticOutputField1
    static_output_field_2: StaticOutputField2
    static_output_field_3: StaticOutputField3
    static_output_field_4: StaticOutputField4
    static_output_field_5: StaticOutputField5
    data: Data
    url: Url
  }

  export interface StaticOutputField1 {
    type: string
  }

  export interface StaticOutputField2 {
    type: string
  }

  export interface StaticOutputField3 {
    type: string
  }

  export interface StaticOutputField4 {
    type: string
  }

  export interface StaticOutputField5 {
    type: string
  }

  export interface Data {
    type: string
  }

  export interface Url {
    type: string
  }

  export interface StaticOutputs {
    type: string
    items: Items2
  }

  export interface Items2 {
    $ref: string
  }

  export interface MultipartOrderSchema {
    type: string
    properties: Properties3
  }

  export interface Properties3 {
    orderPDF: OrderPdf
    productPicture: ProductPicture
    signatureFile: SignatureFile
    OrderObject: OrderObject
  }

  export interface OrderPdf {
    type: string
    format: string
  }

  export interface ProductPicture {
    type: string
    format: string
  }

  export interface SignatureFile {
    type: string
    format: string
  }

  export interface OrderObject {
    type: string
    properties: Properties4
  }

  export interface Properties4 {
    orderID: OrderId
    OrderItemName: OrderItemName
    amount: Amount
  }

  export interface OrderId {
    type: string
  }

  export interface OrderItemName {
    type: string
  }

  export interface Amount {
    type: string
  }

  export interface MultipartSchema {
    type: string
    properties: Properties5
  }

  export interface Properties5 {
    field_1: Field1
    field_2: Field2
    field_3: Field3
    JsonPayload: JsonPayload
  }

  export interface Field1 {
    type: string
    format: string
  }

  export interface Field2 {
    type: string
    format: string
  }

  export interface Field3 {
    type: string
    format: string
  }

  export interface JsonPayload {
    type: string
    properties: Properties6
  }

  export interface Properties6 {
    property_1: Property1
    property_2: Property2
    property_3: Property3
  }

  export interface Property1 {
    type: string
  }

  export interface Property2 {
    type: string
  }

  export interface Property3 {
    type: string
  }

  export interface Properties7 {
    allSchema_field_1: AllSchemaField1
    allSchema_field_2: AllSchemaField2
  }

  export interface AllSchemaField1 {
    type: string
  }

  export interface AllSchemaField2 {
    type: string
  }

  export interface Actions {
    [key: string]: RabAction
  }

  export interface RabAction {
    displayName: string
    description?: string
    group?: string
    urn: string
    input?: Input
    output?: Input,
    $refOpenapi?: string,

    configuration?: Configuration[]
  }

  export interface Input {
    schemaType?: string
    schema?: Schema
    urn?: string

    userDefined?: boolean;
  }

  export interface Schema {
    $ref: string
  }


  export interface Input2 {
    schemaType: string
    schema: Schema3
  }

  export interface Schema3 {
    $ref: string
  }

  export interface Output2 {
    schemaType: string
    schema: Schema4
  }

  export interface Schema4 {
    $ref: string
  }


  export interface Input3 {
    schemaType: string
    schema: Schema5
  }

  export interface Schema5 {
    $ref: string
  }

  export interface Output3 {
    schemaType: string
    schema: Schema6
  }

  export interface Schema6 {
    $ref: string
  }



  export interface Input4 {
    urn: string
  }

  export interface Output4 {
    urn: string
  }



  export interface Input5 {
    urn: string
  }

  export interface Output5 {
    urn: string
  }


  export interface Input6 {
    urn: string
  }

  export interface Output6 {
    urn: string
  }


  export interface Input7 {
    userDefined: boolean
  }

  export interface Output7 {
    userDefined: boolean
  }


  export interface Input8 {
    schemaType: string
    schema: Schema7
  }

  export interface Schema7 {
    $ref: string
  }

  export interface Output8 {
    schemaType: string
    schema: Schema8
  }

  export interface Schema8 {
    $ref: string
  }

  export interface Configuration {
    name: string
    displayName: string
    description: string
    type: string
    required: boolean
    keys?: Key[]
    defaultValue?: string
    columns?: Column[]

    validation?: string

    dependencies?: {
      [key: string]: Dependency
    }
    urn?: string;
  }

  export interface Key {
    keyName: string
    displayName: string
  }

  export interface Column {
    name: string
    displayName: string
    type: string
    keys?: Key2[]
  }

  export interface Key2 {
    keyName: string
    displayName: string
  }




  export interface Key4 {
    keyName: string
    displayName: string
  }

  export interface Dependency {

    values?: any[]

    rowOperation?: RowOperation
  }

  export interface ChildField {
    values: any[]
  }

  export interface ParentField {
    values: any[]
  }


  export interface Input11 {
    schemaType: string
    schema: Schema13
  }

  export interface Schema13 {
    $ref: string
  }

  export interface Output11 {
    schemaType: string
    schema: Schema14
  }

  export interface Schema14 {
    $ref: string
  }

  export interface Configuration4 {
    name: string
    displayName: string
    description: string
    type: string
    required: boolean
    keys?: Key5[]
    dependencies?: Dependencies2
    defaultValue?: string
  }

  export interface Key5 {
    keyName: string
    displayName: string
  }

  export interface Dependencies2 {
    parentField: ParentField2
  }

  export interface ParentField2 {
    values: string[]
  }


  export interface Input12 {
    schemaType: string
    schema: Schema15
  }

  export interface Schema15 {
    $ref: string
  }

  export interface Output12 {
    schemaType: string
    schema: Schema16
  }

  export interface Schema16 {
    $ref: string
  }

  export interface Configuration5 {
    name: string
    displayName: string
    description: string
    urn?: string
    type: string
    required: boolean
    keys?: Key6[]
    dependencies?: Dependencies3
    defaultValue?: string
  }

  export interface Key6 {
    keyName: string
    displayName: string
  }

  export interface Dependencies3 {
    parentField: ParentField3
  }

  export interface ParentField3 {
    values: string[]
  }


  export interface Input13 {
    schemaType: string
    schema: Schema17
  }

  export interface Schema17 {
    $ref: string
  }

  export interface Output13 {
    schemaType: string
    schema: Schema18
  }

  export interface Schema18 {
    $ref: string
  }

  export interface Configuration6 {
    name: string
    displayName: string
    description: string
    type: string
    required: boolean
    keys?: Key7[]
    dependencies?: Dependencies4
  }

  export interface Key7 {
    keyName: string
    displayName: string
  }

  export interface Dependencies4 {
    rowOperation?: RowOperation
    restBizObjList?: RestBizObjList
    selectServiceApp?: SelectServiceApp
    selectServiceBy?: SelectServiceBy
    bizServiceList?: BizServiceList
    bizObjList?: BizObjList
  }

  export interface RowOperation {
    values: string[]
  }

  export interface RestBizObjList {
    values: any[]
  }

  export interface SelectServiceApp {
    values: any[]
  }

  export interface SelectServiceBy {
    values: string[]
  }

  export interface BizServiceList {
    values: any[]
  }

  export interface BizObjList {
    values: any[]
  }


  export interface Input14 {
    schemaType: string
    schema: Schema19
  }

  export interface Schema19 {
    $ref: string
  }

  export interface Output14 {
    schemaType: string
    schema: Schema20
  }

  export interface Schema20 {
    $ref: string
  }

  export interface Configuration7 {
    name: string
    displayName: string
    description: string
    type: string
    defaultValue: string
    validation: string
    required: boolean
  }
  export interface Input15 {
    urn: string
  }

  export interface Output15 {
    schemaType: string
    schema: Schema21
  }

  export interface Schema21 {
    $ref: string
  }

  export interface Triggers {
    notificationTypeTrigger: NotificationTypeTrigger
    notificationTypeWithActivationTrigger: NotificationTypeWithActivationTrigger
    notificationTypeWithActivationTriggerPingJQ: NotificationTypeWithActivationTriggerPingJq
    notificationTypeWithFlowSchemaTrigger: NotificationTypeWithFlowSchemaTrigger
    notificationTypeWithManualSchemaTrigger: NotificationTypeWithManualSchemaTrigger
    notificationTypeWithRuntimeFlowTrigger: NotificationTypeWithRuntimeFlowTrigger
    notificationTypeTriggerWithCustomerMediaType: NotificationTypeTriggerWithCustomerMediaType
  }

  export interface NotificationTypeTrigger {
    displayName: string
    description: string
    group: string
    type: string
    httpMethod: string
    request: Request
    webhook: Webhook
  }

  export interface Request {
    schemaType: string
    schema: Schema22
  }

  export interface Schema22 {
    $ref: string
  }

  export interface Webhook {
    headers: Header[]
    parameters: Parameter[]
    body: Body
  }

  export interface Header {
    name: string
    type: string
  }

  export interface Parameter {
    name: string
    type: string
  }

  export interface Body {
    schemaType: string
    schema: Schema23
  }

  export interface Schema23 {
    $ref: string
  }

  export interface NotificationTypeWithActivationTrigger {
    displayName: string
    description: string
    group: string
    type: string
    httpMethod: string
    request: Request2
    webhook: Webhook2
    subscription: Subscription
    validationRequests: ValidationRequest[]
    configuration: Configuration8[]
  }

  export interface Request2 {
    schemaType: string
    schema: Schema24
  }

  export interface Schema24 {
    $ref: string
  }

  export interface Webhook2 {
    headers: Header2[]
    parameters: Parameter2[]
    body: Body2
  }

  export interface Header2 {
    name: string
    type: string
  }

  export interface Parameter2 {
    name: string
    type: string
  }

  export interface Body2 {
    schemaType: string
    schema: Schema25
  }

  export interface Schema25 {
    $ref: string
  }

  export interface Subscription {
    filter: Filter
    register: string
    deregister: string
  }

  export interface Filter {
    server: Server
    client: Client
  }

  export interface Server { }

  export interface Client {
    condition: string
    acceptStatus: number
    ignoreStatus: number
  }

  export interface ValidationRequest {
    condition: string
    response: Response
  }

  export interface Response {
    status: number
  }

  export interface Configuration8 {
    name: string
    displayName: string
    description: string
    type: string
    required: boolean
    keys?: Key8[]
  }

  export interface Key8 {
    keyName: string
    displayName: string
  }

  export interface NotificationTypeWithActivationTriggerPingJq {
    displayName: string
    description: string
    group: string
    type: string
    httpMethod: string
    request: Request3
    webhook: Webhook3
    subscription: Subscription2
    validationRequests: ValidationRequest2[]
    configuration: Configuration9[]
  }

  export interface Request3 {
    schemaType: string
    schema: Schema26
  }

  export interface Schema26 {
    $ref: string
  }

  export interface Webhook3 {
    headers: Header3[]
    parameters: Parameter3[]
    body: Body3
  }

  export interface Header3 {
    name: string
    type: string
  }

  export interface Parameter3 {
    name: string
    type: string
  }

  export interface Body3 {
    schemaType: string
    schema: Schema27
  }

  export interface Schema27 {
    $ref: string
  }

  export interface Subscription2 {
    filter: Filter2
    register: string
    deregister: string
  }

  export interface Filter2 {
    server: Server2
    client: Client2
  }

  export interface Server2 { }

  export interface Client2 {
    condition: string
    acceptStatus: number
    ignoreStatus: number
  }

  export interface ValidationRequest2 {
    condition: string
    response: string
  }

  export interface Configuration9 {
    name: string
    displayName: string
    description: string
    type: string
    required: boolean
    keys?: Key9[]
  }

  export interface Key9 {
    keyName: string
    displayName: string
  }

  export interface NotificationTypeWithFlowSchemaTrigger {
    displayName: string
    description: string
    group: string
    type: string
    httpMethod: string
    request: Request4
    webhook: Webhook4
    subscription: Subscription3
    configuration: Configuration10[]
  }

  export interface Request4 {
    urn: string
  }

  export interface Webhook4 {
    headers: Header4[]
    parameters: Parameter4[]
    body: Body4
  }

  export interface Header4 {
    name: string
    type: string
  }

  export interface Parameter4 {
    name: string
    type: string
  }

  export interface Body4 {
    urn: string
  }

  export interface Subscription3 {
    register: string
    deregister: string
  }

  export interface Configuration10 {
    name: string
    displayName: string
    description: string
    type: string
    required: boolean
    keys?: Key10[]
  }

  export interface Key10 {
    keyName: string
    displayName: string
  }

  export interface NotificationTypeWithManualSchemaTrigger {
    displayName: string
    description: string
    group: string
    type: string
    httpMethod: string
    request: Request5
    webhook: Webhook5
    subscription: Subscription4
    configuration: Configuration11[]
  }

  export interface Request5 {
    userDefined: boolean
  }

  export interface Webhook5 {
    headers: Header5[]
    parameters: Parameter5[]
    body: Body5
  }

  export interface Header5 {
    name: string
    type: string
  }

  export interface Parameter5 {
    name: string
    type: string
  }

  export interface Body5 {
    userDefined: boolean
  }

  export interface Subscription4 {
    register: string
    deregister: string
  }

  export interface Configuration11 {
    name: string
    displayName: string
    description: string
    type: string
    required: boolean
    keys?: Key11[]
  }

  export interface Key11 {
    keyName: string
    displayName: string
  }

  export interface NotificationTypeWithRuntimeFlowTrigger {
    displayName: string
    description: string
    group: string
    type: string
    urn: string
    httpMethod: string
    request: Request6
    webhook: Webhook6
  }

  export interface Request6 {
    schemaType: string
    schema: Schema28
  }

  export interface Schema28 {
    $ref: string
  }

  export interface Webhook6 {
    headers: Header6[]
    parameters: Parameter6[]
    body: Body6
  }

  export interface Header6 {
    name: string
    type: string
  }

  export interface Parameter6 {
    name: string
    type: string
  }

  export interface Body6 {
    schemaType: string
    schema: Schema29
  }

  export interface Schema29 {
    $ref: string
  }

  export interface NotificationTypeTriggerWithCustomerMediaType {
    displayName: string
    description: string
    group: string
    type: string
    httpMethod: string
    request: Request7
    webhook: Webhook7
  }

  export interface Request7 {
    schemaType: string
    schema: Schema30
  }

  export interface Schema30 {
    $ref: string
  }

  export interface Webhook7 {
    headers: Header7[]
    parameters: Parameter7[]
    body: Body7
  }

  export interface Header7 {
    name: string
    type: string
  }

  export interface Parameter7 {
    name: string
    type: string
  }

  export interface Body7 {
    schemaType: string
    schema: Schema31
  }

  export interface Schema31 {
    $ref: string
  }

  export interface Flows {
    [key: string]: Flow
  }

  export interface Flow {
    id: string
    specVersion: string
    version: string
    start: string
    functions: Function[]
    states: State[]
  }

  export interface Function {
    name: string
    type: string
    operation: string
  }

  export interface State {
    name: string
    type: string
    actions: Action[]
    end: boolean
  }

  export interface Action {
    functionRef: FunctionRef
    actionDataFilter: ActionDataFilter
  }

  export interface FunctionRef {
    refName: string
    arguments: Arguments
  }

  export interface Arguments {
    uri?: string
    method?: string
    body?: string
  }

  export interface ActionDataFilter {
    results: string
    toStateData: string
  }

  export interface Function2 {
    name: string
    type: string
    operation: string
  }

  export interface State2 {
    name: string
    type: string
    actions: Action2[]
    end: boolean
  }

  export interface Action2 {
    functionRef: string
    actionDataFilter: ActionDataFilter2
  }

  export interface ActionDataFilter2 {
    toStateData: string
  }

  export interface Function3 {
    name: string
    type: string
    operation: string
  }

  export interface State3 {
    name: string
    type: string
    actions: Action3[]
    end: boolean
  }

  export interface Action3 {
    functionRef: string
    actionDataFilter: ActionDataFilter3
  }

  export interface ActionDataFilter3 {
    toStateData: string
  }

  export interface Function4 {
    name: string
    type: string
    operation: string
  }

  export interface State4 {
    name: string
    type: string
    actions: Action4[]
    end: boolean
  }

  export interface Action4 {
    functionRef: string
    actionDataFilter: ActionDataFilter4
  }

  export interface ActionDataFilter4 {
    toStateData: string
  }
  export interface Function5 {
    name: string
    type: string
    operation: string
  }

  export interface State5 {
    name: string
    type: string
    actions: Action5[]
    end: boolean
  }

  export interface Action5 {
    functionRef: FunctionRef2
    actionDataFilter: ActionDataFilter5
  }

  export interface FunctionRef2 {
    refName: string
    arguments: Arguments2
  }

  export interface Arguments2 {
    uri: string
    method: string
    body: string
  }

  export interface ActionDataFilter5 {
    results: string
    toStateData: string
  }

  export interface Function6 {
    name: string
    type: string
    operation: string
  }

  export interface State6 {
    name: string
    type: string
    actions: Action6[]
    end: boolean
  }

  export interface Action6 {
    functionRef: string
    actionDataFilter: ActionDataFilter6
  }

  export interface ActionDataFilter6 {
    toStateData: string
  }

  export interface Function7 {
    name: string
    type: string
    operation: string
  }

  export interface State7 {
    name: string
    type: string
    actions: Action7[]
    end: boolean
  }

  export interface Action7 {
    functionRef: string
    actionDataFilter: ActionDataFilter7
  }

  export interface ActionDataFilter7 {
    toStateData: string
  }

  export interface Function8 {
    name: string
    type: string
    operation: string
  }

  export interface State8 {
    name: string
    type: string
    actions: Action8[]
    end: boolean
  }

  export interface Action8 {
    functionRef: string
    actionDataFilter: ActionDataFilter8
  }

  export interface ActionDataFilter8 {
    toStateData: string
  }

  export interface Function9 {
    name: string
    type: string
    operation: string
  }

  export interface State9 {
    name: string
    type: string
    actions: Action9[]
    end: boolean
  }

  export interface Action9 {
    functionRef: string
    actionDataFilter: ActionDataFilter9
  }

  export interface ActionDataFilter9 {
    toStateData: string
  }


  export interface Function10 {
    name: string
    type: string
    operation: string
  }

  export interface State10 {
    name: string
    type: string
    actions: Action10[]
    end: boolean
  }

  export interface Action10 {
    functionRef: string
    actionDataFilter: ActionDataFilter10
  }

  export interface ActionDataFilter10 {
    toStateData: string
  }

  export interface Function11 {
    name: string
    type: string
    operation: string
  }

  export interface State11 {
    name: string
    type: string
    actions: Action11[]
    end: boolean
  }

  export interface Action11 {
    functionRef: string
    actionDataFilter: ActionDataFilter11
  }

  export interface ActionDataFilter11 {
    toStateData: string
  }

  export interface Function12 {
    name: string
    type: string
    operation: string
  }

  export interface State12 {
    name: string
    type: string
    actions: Action12[]
    end: boolean
  }

  export interface Action12 {
    functionRef: string
    actionDataFilter: ActionDataFilter12
  }

  export interface ActionDataFilter12 {
    toStateData: string
  }

  export interface Function13 {
    name: string
    type: string
    operation: string
  }

  export interface State13 {
    name: string
    type: string
    actions: Action13[]
    end: boolean
  }

  export interface Action13 {
    functionRef: string
    actionDataFilter: ActionDataFilter13
  }

  export interface ActionDataFilter13 {
    toStateData: string
  }

}

export namespace OpenAPINS {

  export interface UIStateActionDeltaAdd {
    actionRef: string
  }

  export interface UIStateActionDeltaItem {
    actionRef: string,
    actionDisplayName: string,
  }

  export interface UIStateActionDeltaRemove extends UIStateActionDeltaItem {
    // force?: boolean
  }

  export interface UIStateForBackend {
    actionDelta: {
      add: UIStateActionDeltaAdd[],
      remove: UIStateActionDeltaRemove[],
      selected: UIStateActionDeltaAdd[],
    }
  }

  export type MethodDefinition = {

    isSelected?: boolean;
    fullPathId?: string;

    summary: string
    requestBody?: {
      [key: string]: any
    }
    operationId: string
    tags: Array<string>
    parameters?: Array<{
      name: string
      in: string
      description: string
      required: boolean
      schema: {
        [key: string]: any
      }
    }>
    responses?: {
      [key: string]: any
    }
  };
  export type PathDefinition = {
    [key: string]: MethodDefinition
  };
  export type Root = {
    openapi: string
    info: {
      version: string
      title: string
      license: {
        name: string
      }
    }
    servers: Array<{
      url: string
    }>
    paths: {
      [key: string]: PathDefinition
    }
    components: {
      schemas: {
        [key: string]: {
          [key: string]: any
        }
      }
    }

  }
}


export namespace PostmanNs {
  export interface Root {
    info: Info
    item: Item[]
    auth?: Auth2
    event?: Event[]
    variable?: Variable3[]
  }

  export interface Info {
    _postman_id: string
    name: string
    description?: string
    schema: string
    _exporter_id: string
  }

  export interface Item2 {
    name: string;
    request: Request;
    response: Response[];

    description?: string
  }
  export interface Item extends Partial<Item2> {
    item?: Item[];
    isSelected?: boolean;
    isSelectedForTestConnection?: boolean;
  }

  export interface Request {
    auth?: Auth
    method: string
    header: Header[]
    body?: Body
    url: Url
    description?: string
  }

  export interface Auth {
    type: string
    bearer: Bearer[]
  }

  export interface Bearer {
    key: string
    value: string
    type: string
  }

  export interface Header {
    key: string
    value: string
    type: string
  }

  export interface Body {
    mode: string
    raw: string
    options: Options
  }

  export interface Options {
    raw: Raw
  }

  export interface Raw {
    language: string
  }

  export interface Url {
    raw: string
    host: string[]
    protocol?: string
    path: string[]
    query?: Query[]
    variable?: Variable[]
    port?: string;
  }

  export interface Query {
    key: string
    value: string
  }

  export interface Variable {
    key: string
    value: string
  }

  export interface Response {
    name: string
    originalRequest: OriginalRequest
    status: string
    code: number
    _postman_previewlanguage: string
    header: Header3[]
    cookie: any[]
    body: string
  }

  export interface OriginalRequest {
    method: string
    header: Header2[]
    body?: Body2
    url: Url2
  }

  export interface Header2 {
    key: string
    value: string
    type: string
  }

  export interface Body2 {
    mode: string
    raw: string
    options: Options2
  }

  export interface Options2 {
    raw: Raw2
  }

  export interface Raw2 {
    language: string
  }

  export interface Url2 {
    raw: string
    host: string[]
    path: string[]
    query?: Query2[]
    variable?: Variable2[]
    protocol?: string
    port?: string
  }

  export interface Query2 {
    key: string
    value: string
  }

  export interface Variable2 {
    key: string
    value: string
  }

  export interface Header3 {
    key: string
    value: string
  }

  export interface Auth2 {
    type: string
    oauth2: Oauth2[]
  }

  export interface Oauth2 {
    key: string
    value: any
    type: string
  }

  export interface Event {
    listen: string
    script: Script
  }

  export interface Script {
    type: string
    exec: string[]
  }

  export interface Variable3 {
    key: string
    value: string
    type?: string
  }

}