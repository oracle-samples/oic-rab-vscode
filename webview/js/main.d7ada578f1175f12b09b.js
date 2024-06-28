/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
 (self.webpackChunkweb_jetui=self.webpackChunkweb_jetui||[]).push([[179],{6454:(e,t,a)=>{"use strict";a.r(t)},2306:(e,t,a)=>{var n,s;n=[a,t,a(6584),a(8661),a(9818),a(5540),a(3774),a(9338),a(6454)],s=function(e,t,a,n,s,o,l,c){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){const e=(0,s.useNavigate)();return(0,n.useEffect)((()=>{l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.webviewRouterReady,{isReady:!0})}),[]),(0,n.useEffect)((()=>l.UtilsNs.listenVscodeExtension(c.SharedNs.ExtensionCommandEnum.routerNavigateTo,(t=>{const a=t.href;Object.values(c.SharedNs.WebviewRouteEnum).includes(a)?e(a):console.error("Unknown href payload.href. Should be one of the allowed values in SharedNs.WebviewRouteEnum",c.SharedNs.WebviewRouteEnum)}))),[]),(0,a.jsxs)("div",Object.assign({className:"App"},{children:[(0,a.jsx)(o.RabAdd,{}),(0,a.jsx)(s.Outlet,{})]}))}}.apply(t,n),void 0===s||(e.exports=s)},4343:(e,t,a)=>{var n,s;n=[a,t,a(904)],s=function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.useAppSelector=t.useAppDispatch=void 0,t.useAppDispatch=()=>(0,a.useDispatch)(),t.useAppSelector=a.useSelector}.apply(t,n),void 0===s||(e.exports=s)},96:function(e,t,a){var n,s,o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};n=[a,t,a(6584),a(9818),a(2248),a(9644),a(3260),a(9338),a(2306)],s=function(e,t,a,n,s,l,c,d,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.router=void 0,i=o(i),t.router=(0,n.createBrowserRouter)([{path:d.SharedNs.WebviewRouteEnum.Root,element:(0,a.jsx)(i.default,{}),children:[{index:!0,element:(0,a.jsx)(n.Navigate,{to:d.SharedNs.WebviewRouteEnum.Copilot})},{path:d.SharedNs.WebviewRouteEnum.Copilot,element:(0,a.jsx)(s.Copilot,{}),children:[{index:!0,element:(0,a.jsx)(n.Navigate,{to:d.SharedNs.WebviewRouteEnum.PostmanAdd})}]},{path:d.SharedNs.WebviewRouteEnum.PostmanAdd,element:(0,a.jsx)(c.PostmanSelect,{})},{path:d.SharedNs.WebviewRouteEnum.OpenAPIAdd,element:(0,a.jsx)(l.OpenAPISelect,{})}]}])}.apply(t,n),void 0===s||(e.exports=s)},2398:function(e,t,a){var n,s,o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};n=[a,t,a(3629),a(5409),a(9059),a(7365),a(583)],s=function(e,t,a,n,s,l,c){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.store=void 0,n=o(n),s=o(s),l=o(l),c=o(c),t.store=(0,a.configureStore)({reducer:{copilot:n.default,postmanSelect:l.default,openAPISelect:s.default,rabAdd:c.default}})}.apply(t,n),void 0===s||(e.exports=s)},8990:(e,t,a)=>{var n,s;n=[a,t,a(6584),a(8854),a(396),a(9812),a(5432),a(9093),a(96),a(2398),a(904),a(9818)],s=function(e,t,a,n,s,o,l,c,d,i,r,u){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.App=void 0,t.App=(0,n.registerCustomElement)("app-root",(({appName:e="RAB"})=>((0,s.useEffect)((()=>{c.getPageContext().getBusyContext().applicationBootstrapComplete()}),[]),(0,a.jsx)(r.Provider,Object.assign({store:i.store},{children:(0,a.jsxs)("div",Object.assign({id:"appContainer",class:"oj-web-applayout-page"},{children:[(0,a.jsx)(l.Header,{appName:e}),(0,a.jsx)(u.RouterProvider,{router:d.router}),(0,a.jsx)(o.Footer,{})]}))})))),"App",{properties:{appName:{type:"string"}}},{appName:"RAB"})}.apply(t,n),void 0===s||(e.exports=s)},9812:(e,t,a)=>{var n;n=function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.Footer=void 0,t.Footer=function(){return null}}.apply(t,[a,t]),void 0===n||(e.exports=n)},5432:function(e,t,a){var n,s,o=this&&this.__createBinding||(Object.create?function(e,t,a,n){void 0===n&&(n=a);var s=Object.getOwnPropertyDescriptor(t,a);s&&!("get"in s?!t.__esModule:s.writable||s.configurable)||(s={enumerable:!0,get:function(){return t[a]}}),Object.defineProperty(e,n,s)}:function(e,t,a,n){void 0===n&&(n=a),e[n]=t[a]}),l=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),c=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var a in e)"default"!==a&&Object.prototype.hasOwnProperty.call(e,a)&&o(t,e,a);return l(t,e),t};n=[a,t,a(6584),a(9666),a(396),a(537),a(9767),a(2781)],s=function(e,t,a,n,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.Header=void 0,n=c(n),t.Header=function({appName:e}){const t=(0,s.useRef)(window.matchMedia(n.getFrameworkQuery("sm-only"))),[o,l]=(0,s.useState)(t.current.matches);function c(e){l(e.matches)}return(0,s.useEffect)((()=>(t.current.addEventListener("change",c),()=>t.current.removeEventListener("change",c))),[t]),(0,a.jsx)("header",Object.assign({role:"banner",class:"oj-web-applayout-header"},{children:(0,a.jsxs)("div",Object.assign({class:"oj-web-applayout-max-width oj-flex-bar oj-sm-align-items-center"},{children:[(0,a.jsxs)("div",Object.assign({class:"oj-flex-bar-middle oj-sm-align-items-baseline"},{children:[(0,a.jsx)("span",{role:"img",class:"oj-icon demo-oracle-icon",title:"Oracle Logo",alt:"Oracle Logo"}),(0,a.jsx)("h1",Object.assign({class:"oj-sm-only-hide oj-web-applayout-header-title",title:"Application Name"},{children:e}))]})),(0,a.jsx)("div",{class:"oj-flex-bar-end"})]}))}))}}.apply(t,n),void 0===s||(e.exports=s)},2248:function(e,t,a){var n,s,o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};n=[a,t,a(6584),a(4343),a(8661),a(9818),a(5538),a(3774),a(9338),a(5409),a(537)],s=function(e,t,a,n,s,l,c,d,i,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.Copilot=void 0;const u=(c=o(c)).default.div((({theme:e})=>({height:"calc(96vh - 20px)!important",border:"1px solid #ccc",padding:"10px",margin:"10px",borderRadius:"10px"}))),p=c.default.div((({theme:e})=>({bottom:"40px",position:"fixed"}))),m=c.default.span((({theme:e})=>({right:"20px",position:"fixed",zIndex:1e3})));function h(){return(0,n.useAppSelector)(r.selectCopilot),(0,a.jsx)("ul",{})}t.Copilot=function(){(0,n.useAppDispatch)();const e=(0,n.useAppSelector)(r.selectCopilot),t=(0,l.useNavigate)(),o=(0,s.useCallback)((()=>{d.UtilsNs.notifyVscodeExtension(i.SharedNs.WebviewCommandEnum.webviewLifecycle,{type:"close"})}),[]);return(0,s.useEffect)((()=>{e.finishSteps?o():t(e.currentStep)}),[e,o]),(0,a.jsxs)(u,{children:[(0,a.jsx)(m,Object.assign({"aria-label":"delete",onClick:o},{children:(0,a.jsxs)("oj-button",Object.assign({id:"icon_button1",display:"icons"},{children:["Icon Button",(0,a.jsx)("span",{slot:"startIcon",class:"oj-ux-ico-close-circle"})]}))})),(0,a.jsx)(h,{}),(0,a.jsx)(p,{children:(0,a.jsx)(l.Outlet,{})})]})}}.apply(t,n),void 0===s||(e.exports=s)},5409:(e,t,a)=>{var n,s;n=[a,t,a(3629),a(9338)],s=function(e,t,a,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.selectCopilot=t.gotoNextStep=t.copilotSlice=void 0;const s=n.SharedNs.WebviewRouteEnum.PostmanAdd,o={steps:[s,n.SharedNs.WebviewRouteEnum.PostmanAdd],currentStepNumber:0,currentStep:s,status:"idle"};t.copilotSlice=(0,a.createSlice)({name:"copilotSlice",initialState:o,reducers:{gotoNextStep:(e,t)=>{e.currentStepNumber!==e.steps.length-1?(e.currentStepNumber++,e.currentStep=e.steps[e.currentStepNumber]):e.finishSteps=!0}}}),t.gotoNextStep=t.copilotSlice.actions.gotoNextStep,t.selectCopilot=e=>e.copilot,t.default=t.copilotSlice.reducer}.apply(t,n),void 0===s||(e.exports=s)},9644:function(e,t,a){var n,s,o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};n=[a,t,a(6584),a(8661),a(4343),a(3774),a(9338),a(5538),a(9059),a(1597),a(4679),a(537),a(3970),a(3917),a(255),a(7376)],s=function(e,t,a,n,s,l,c,d,i,r,u){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.OpenAPISelect=void 0,d=o(d),r=o(r);const p=d.default.div((({theme:e})=>({margin:"2vh"}))),m=d.default.div((({theme:e})=>({marginBottom:"2vh"}))),h=d.default.div((({theme:e})=>({marginBottom:"2vh"}))),f=d.default.div((({theme:e})=>({marginBottom:"2vh"}))),v=d.default.div((({theme:e})=>({marginBottom:"2vh"})));t.OpenAPISelect=function(){const e=(0,s.useAppSelector)(i.selectEntryType),t=(0,s.useAppSelector)(i.selectOpenAPISelect),o=((0,s.useAppSelector)(i.selectADD),(0,s.useAppSelector)(i.selectOpenAPIStatus)),d=((0,s.useAppSelector)(i.selectOpenAPIChecked),(0,s.useAppSelector)(i.selectOpenAPIWithTagsChecked)),A=(0,s.useAppSelector)(i.selectOpenAPIToRemove),y=(0,s.useAppSelector)(i.selectOpenAPIToAdd),P=(0,s.useAppSelector)(i.selectOpenAPIIsSelectAll),S=(0,s.useAppSelector)(i.selectOpenAPIValidity),b=(0,s.useAppDispatch)(),[O,g]=(0,n.useState)(new r.default([])),[E,j]=(0,n.useState)([]);(0,n.useEffect)((()=>{window.vscode===window&&b((0,i.getOpenAPIDataAsync)())}),[]),(0,n.useEffect)((()=>{if(t&&t.paths){const e=(0,u.convertOpenAPIPathesToTree)(t);g(new r.default(e,{keyAttributes:"id"}))}}),[t]),(0,n.useEffect)((()=>l.UtilsNs.listenVscodeExtension(c.SharedNs.ExtensionCommandEnum.updateOpenAPIRawData,(e=>{e?b((0,i.updateOpenAPIRawData)(e)):console.error("[OpenAPISelect] openAPIDocumentData must be set as OpenAPI Document JSON string")}))),[]),(0,n.useEffect)((()=>l.UtilsNs.listenVscodeExtension(c.SharedNs.ExtensionCommandEnum.updateEntryType,(e=>{b((0,i.setEntryType)(e))}))),[]),(0,n.useEffect)((()=>{const e=Object.values(S.details).map((e=>e.map((e=>e)))).reduce(((e,t)=>e.concat(t)),[]);j(e)}),[S]);const C=(0,n.useCallback)((e=>{b((0,i.selectByNames)({value:e.detail.value,previousValue:e.detail.previousValue,updatedFrom:e.detail.updatedFrom}))}),[]),w=(0,n.useCallback)((()=>{S.valid?(console.log("openAPIStatus to be posted",o),e===c.SharedNs.VscodeCommandPayloadEntryType.OpenAPIConvertDocument?l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.openAPIDoneConvertDocument,o):l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.openAPISelectRequests,o),l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.webviewLifecycle,{type:"close"})):alert("The selection is invalid.")}),[o,e,S]),I=(0,n.useCallback)((()=>{b(P?(0,i.deselectAll)():(0,i.selectAll)())}),[P]);return(0,n.useEffect)((()=>{l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.openAPISelectReady,{isReady:!0})}),[]),(0,a.jsxs)(p,{children:[e!==c.SharedNs.VscodeCommandPayloadEntryType.OpenAPIConvertDocument&&(0,a.jsx)("h2",{children:"Select the OpenAPI paths and methods that you want to add to the adapter definition document."}),e===c.SharedNs.VscodeCommandPayloadEntryType.OpenAPIConvertDocument&&(0,a.jsx)("h2",{children:"Select the OpenAPI paths and methods that you want to convert to the adapter definition document."}),(0,a.jsxs)(v,{children:["There are ",y.length," requests to add",A.length?` and ${A.length} requests to remove`:"","."]}),(0,a.jsx)(m,{children:(0,a.jsx)("oj-button",Object.assign({onClick:w,disabled:!S.valid},{children:"Done"}))}),!S.valid&&(0,a.jsx)(f,{children:(0,a.jsx)("oj-messages",{messages:E,position:null,display:"general",displayOptions:{category:"none"}})}),(0,a.jsx)(h,{children:(0,a.jsx)("oj-checkboxset",Object.assign({value:[P],onClick:I},{children:(0,a.jsx)("oj-option",Object.assign({value:!0},{children:"Select All"}))}))}),(0,a.jsx)("oj-tree-view",{id:"select_requests",data:O,selectionMode:"multiple","aria-label":"All OpenAPI operations",onselectionChanged:C,selection:d,item:{renderer:({data:e})=>({insert:e.title})}})]})}}.apply(t,n),void 0===s||(e.exports=s)},4679:(e,t,a)=>{var n;n=function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.convertOpenAPIPathesToTree=t.allHttpMethods=t.getAllOpenAPITagMap=t.resolveRef=t.getSelectedOpenAPIPath=t.annotateOpenAPIRawData=t.setAllWithSelectionState=t.getSelectedOpenAPIPathForBackend=t.getSelectedOpenAPIPathFromADD=t.selectItemsByFullPathId=t.filterValidTags=t.MAX_OPEN_API_REQUEST_COUNT=void 0;const a="$___TAG___$",n="Not Tagged",s=n;t.MAX_OPEN_API_REQUEST_COUNT=200,t.filterValidTags=(e,t=[])=>{let a=(null!=t?t:[]).filter((t=>!!e[t]));return a.length||(a=[n]),a},t.selectItemsByFullPathId=(e,n,s,o)=>{if(!(null==e?void 0:e.paths))return;const l=(0,t.getAllOpenAPITagMap)(e);Object.entries(e.paths).forEach((e=>{e[0];const c=e[1];Object.entries(c).filter((e=>t.allHttpMethods.includes(e[0]))).forEach((e=>{e[0];const c=e[1],d=(0,t.filterValidTags)(l,e[1].tags),i=void 0!==o;if(!c.fullPathId)throw new Error("fullPathId is not defined: "+JSON.stringify(c));const r=d.find((e=>{const t=`${a}${e}`;return 1===s.length&&s[0]===t}));if(r)c.isSelected=!!n[`${a}${r}`];else if(c.fullPathId&&(!!n[c.fullPathId]!==c.isSelected||i))try{c.isSelected=i?o:!!n[c.fullPathId]}catch(e){console.warn(e)}}))}))},t.getSelectedOpenAPIPathFromADD=e=>(null==e?void 0:e.actions)?Object.fromEntries(Object.entries(e.actions).filter((e=>!!e[1].$refOpenapi)).map((e=>{const t=e[1].$refOpenapi,a=e[1];return[t,{actionRef:a.$refOpenapi,actionDisplayName:a.displayName}]}))):{},t.getSelectedOpenAPIPathForBackend=({openapi:e,add:a})=>{const n=[],s=[],o=[];if(!(null==e?void 0:e.paths))return{actionDelta:{selected:n,add:s,remove:o}};const l=(0,t.getSelectedOpenAPIPathFromADD)(a);return console.log("[getSelectedOpenAPIPathForBackend] add",a),Object.entries(e.paths).forEach((e=>{e[0];const a=e[1];Object.entries(a).filter((e=>t.allHttpMethods.includes(e[0]))).map((e=>{e[0];const t=e[1],a=t.isSelected,c=l[t.fullPathId];a&&n.push({actionRef:t.fullPathId}),c&&a||!c&&!a||(a?s.push({actionRef:t.fullPathId}):o.push(Object.assign({},c)))}))})),{actionDelta:{add:s,selected:n,remove:o}}},t.setAllWithSelectionState=(e,a)=>{(null==e?void 0:e.paths)&&Object.entries(e.paths).forEach((e=>{e[0];const n=e[1];Object.entries(n).filter((e=>t.allHttpMethods.includes(e[0]))).forEach((e=>{e[0],e[1].isSelected=!!a}))}))},t.annotateOpenAPIRawData=({openapi:e,add:a})=>{if(!(null==e?void 0:e.paths))return;const n=(0,t.getSelectedOpenAPIPath)(a);return Object.entries(e.paths).forEach((e=>{const a=e[0],s=e[1];Object.entries(s).filter((e=>t.allHttpMethods.includes(e[0]))).forEach((e=>{const t=e[0],s=e[1];s.fullPathId=`${t.toUpperCase()}:${a}`,s.isSelected=!!s.isSelected||!!n.has(s.fullPathId)}))})),e},t.getSelectedOpenAPIPath=e=>(null==e?void 0:e.actions)?new Set((Object.values(e.actions)||[]).filter((e=>!!e.$refOpenapi)).map((e=>e.$refOpenapi))):new Set,t.resolveRef=(e,a)=>{if(!e||"object"!=typeof e)return e;const n={};return Object.entries(e).forEach((e=>{const s=e[0],o=e[1];if("object"!=typeof o||!o)return void(n[s]=o);const l=o.$ref;n[s]=l?(0,t.resolveRef)(((e,t)=>{if(!(e=e.trim()).startsWith("#"))throw new Error("only support $ref started with #");const a=(e=e.replace("#","").replace(/(^\/|\/$)/g,"")).split("/");let n=t;for(;a.length;)if(n=n[a.shift()],!n)throw new Error(`[findObjectByRef] Unable to find ref [${e}] from openapi [${JSON.stringify(t)}]`);return n})(l,a),a):(0,t.resolveRef)(o,a)})),n},t.getAllOpenAPITagMap=e=>{var t;const a=Object.fromEntries(Object.values(null!==(t=null==e?void 0:e.tags)&&void 0!==t?t:[]).map((e=>[e.name,Object.assign(Object.assign({},e),{children:[]})])));return a[s]={children:[],name:n},a},t.allHttpMethods=["get","post","put","delete","head","options","patch","connect","trace"],t.convertOpenAPIPathesToTree=e=>{const n=(...e)=>{const t=e.filter((e=>!!e));return t.length<2?t.join(""):`${t.shift()} ${t.length?`(${t.join("; ")})`:""}`},s=(0,t.getAllOpenAPITagMap)(e),o=e.paths;return Object.entries(null!=o?o:{}).forEach((e=>{const a=e[0];return Object.entries(e[1]).filter((e=>t.allHttpMethods.includes(e[0]))).map((e=>{const o=e[0].toUpperCase(),l=e[1],c=(0,t.filterValidTags)(s,l.tags),d=`${o}:${a}`,i={title:n(l.summary,l.operationId,`${o}:${a}`),id:d,selected:!!l.isSelected};c.forEach((e=>{s[e].children.push(i)}))}))})),Object.values(s).map((e=>({title:`${e.name} ${e.description?`(${e.description})`:""}`,id:`${a}${e.name}`,selected:e.children.length&&e.children.every((e=>e.selected)),children:e.children}))).filter((e=>e.children.length))}}.apply(t,[a,t]),void 0===n||(e.exports=n)},9059:function(e,t,a){var n,s,o=this&&this.__awaiter||function(e,t,a,n){return new(a||(a=Promise))((function(s,o){function l(e){try{d(n.next(e))}catch(e){o(e)}}function c(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?s(e.value):(t=e.value,t instanceof a?t:new a((function(e){e(t)}))).then(l,c)}d((n=n.apply(e,t||[])).next())}))};n=[a,t,a(3629),a(6486),a(9338),a(4679)],s=function(e,t,a,n,s,l){"use strict";var c;Object.defineProperty(t,"__esModule",{value:!0}),t.selectOpenAPIValidity=t.selectOpenAPIToAdd=t.selectOpenAPIToRemove=t.selectOpenAPIIsSelectAll=t.selectOpenAPIWithTagsChecked=t.selectOpenAPIChecked=t.selectOpenAPITagChecked=t.selectOpenAPIStatus=t.selectEntryType=t.selectADD=t.selectOpenAPISelectRaw=t.selectOpenAPISelect=t.deselectAll=t.selectAll=t.setEntryType=t.updateOpenAPIRawData=t.selectByNames=t.openAPISelectSlice=t.getOpenAPIDataAsync=void 0;const d={entryType:s.SharedNs.VscodeCommandPayloadEntryType.OpenAPIAddRequest,status:"idle"};t.getOpenAPIDataAsync=(0,a.createAsyncThunk)("openAPISelect/getOpenAPIRawData",(()=>o(void 0,void 0,void 0,(function*(){return{}}))));const i=(e,t)=>{e.value=(0,l.annotateOpenAPIRawData)(t),e.valueRaw=t.openapi,e.addValue=t.add};t.openAPISelectSlice=(0,a.createSlice)({name:"openAPISelect",initialState:d,reducers:{selectByNames:(e,t)=>{const a=t.payload.previousValue,s=t.payload.value,o=(0,n.difference)(s,a),c=(0,n.difference)(a,s),d=Object.fromEntries(t.payload.value.map((e=>[e,!0])));(0,l.selectItemsByFullPathId)(e.value,d,"internal"===t.payload.updatedFrom?(0,n.uniq)([...o,...c]):[])},selectAll:(e,t)=>{(0,l.selectItemsByFullPathId)(e.value,{},[],!0)},deselectAll:(e,t)=>{(0,l.selectItemsByFullPathId)(e.value,{},[],!1)},updateOpenAPIRawData:(e,t)=>{e.status="idle",i(e,t.payload)},setEntryType:(e,t)=>{e.entryType=t.payload}},extraReducers:e=>{e.addCase(t.getOpenAPIDataAsync.pending,(e=>{e.status="loading"})).addCase(t.getOpenAPIDataAsync.fulfilled,((e,t)=>{e.status="idle",i(e,t.payload)})).addCase(t.getOpenAPIDataAsync.rejected,(e=>{e.status="failed"}))}}),c=t.openAPISelectSlice.actions,t.selectByNames=c.selectByNames,t.updateOpenAPIRawData=c.updateOpenAPIRawData,t.setEntryType=c.setEntryType,t.selectAll=c.selectAll,t.deselectAll=c.deselectAll,t.selectOpenAPISelect=e=>e.openAPISelect.value,t.selectOpenAPISelectRaw=e=>e.openAPISelect.valueRaw,t.selectADD=e=>e.openAPISelect.addValue,t.selectEntryType=e=>e.openAPISelect.entryType,t.selectOpenAPIStatus=(0,a.createSelector)(t.selectOpenAPISelect,t.selectADD,((e,t)=>e?(0,l.getSelectedOpenAPIPathForBackend)({openapi:e,add:t}):{actionDelta:{add:[],remove:[],selected:[]}})),t.selectOpenAPITagChecked=(0,a.createSelector)(t.selectOpenAPISelect,(e=>{if(!e)return[];const t=(0,l.convertOpenAPIPathesToTree)(e).filter((e=>{var t;return(null===(t=e.children)||void 0===t?void 0:t.length)&&e.children.every((e=>e.selected))})).map((e=>e.id));return t})),t.selectOpenAPIChecked=(0,a.createSelector)(t.selectOpenAPIStatus,(e=>e.actionDelta.selected.map((e=>e.actionRef)))),t.selectOpenAPIWithTagsChecked=(0,a.createSelector)(t.selectOpenAPIChecked,t.selectOpenAPITagChecked,((e,t)=>[...e,...t])),t.selectOpenAPIIsSelectAll=(0,a.createSelector)(t.selectOpenAPISelect,(e=>(null==e?void 0:e.paths)&&Object.values(e.paths).every((e=>Object.entries(e).filter((e=>l.allHttpMethods.includes(e[0]))).every((e=>e[1].isSelected)))))),t.selectOpenAPIToRemove=(0,a.createSelector)(t.selectOpenAPIStatus,(e=>e.actionDelta.remove.map((e=>e.actionRef)))),t.selectOpenAPIToAdd=(0,a.createSelector)(t.selectOpenAPIStatus,(e=>e.actionDelta.add.map((e=>e.actionRef)))),t.selectOpenAPIValidity=(0,a.createSelector)(t.selectOpenAPIChecked,t.selectOpenAPIToAdd,t.selectOpenAPIToRemove,((e,t,a)=>{const n={valid:!1,details:{}};return e.length>l.MAX_OPEN_API_REQUEST_COUNT&&(n.details.MAX_OPEN_API_REQUEST_COUNT=[{severity:"error",summary:`You can at most select ${l.MAX_OPEN_API_REQUEST_COUNT} requests.`}]),0===t.length&&0===a.length&&(n.details.MAX_OPEN_API_REQUEST_COUNT=[{severity:"info",summary:"There are no changes."}]),n.valid=!Object.keys(n.details).length,n})),t.default=t.openAPISelectSlice.reducer}.apply(t,n),void 0===s||(e.exports=s)},3260:function(e,t,a){var n,s,o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};n=[a,t,a(6584),a(8661),a(4343),a(3774),a(9338),a(5538),a(7365),a(1597),a(537),a(3970),a(3917),a(7376)],s=function(e,t,a,n,s,l,c,d,i,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.PostmanSelect=void 0,d=o(d),r=o(r);const u=d.default.div((({theme:e})=>({margin:"2vh"}))),p=d.default.div((({theme:e})=>({marginBottom:"2vh"}))),m=d.default.div((({theme:e})=>({marginBottom:"2vh"}))),h=d.default.div((({theme:e})=>({marginBottom:"2vh"}))),f=d.default.div((({theme:e})=>({marginBottom:"2vh"}))),v=e=>{var t;return(null===(t=e.item)||void 0===t?void 0:t.map((e=>{var t;let a={title:e.name,id:e.name,selected:!!e.isSelected,children:v(e)};return(null===(t=a.children)||void 0===t?void 0:t.length)||delete a.children,a})))||[]};t.PostmanSelect=function(){const e=(0,s.useAppSelector)(i.selectEntryType),t=(0,s.useAppSelector)(i.selectPostmanSelect),o=(0,s.useAppSelector)(i.selectPostmanChecked),d=(0,s.useAppSelector)(i.selectPostmanCheckedWithParentNodes),A=(0,s.useAppSelector)(i.selectPostmanCheckedForTestConnection),y=(0,s.useAppDispatch)(),[P,S]=(0,n.useState)(new r.default([])),b=(0,s.useAppSelector)(i.selectPostmanValidity),[O,g]=(0,n.useState)(!1),[E,j]=(0,n.useState)([]);(0,n.useEffect)((()=>{e===c.SharedNs.VscodeCommandPayloadEntryType.PostmanConvertDocument&&(y((0,i.selectAll)()),g(!0))}),[e]),(0,n.useEffect)((()=>{window.vscode===window&&y((0,i.getPostmanDataAsync)())}),[]),(0,n.useEffect)((()=>{if(t&&t.item){const e=v(t);S(new r.default(e,{keyAttributes:"id"}))}}),[t]),(0,n.useEffect)((()=>l.UtilsNs.listenVscodeExtension(c.SharedNs.ExtensionCommandEnum.updatePostmanRawData,(e=>{e?y((0,i.updatePostmanRawData)(e)):console.error("[PostmanSelect] postmanCollectionData must be set as the postman collection JSON string")}))),[]),(0,n.useEffect)((()=>l.UtilsNs.listenVscodeExtension(c.SharedNs.ExtensionCommandEnum.updateEntryType,(e=>{y((0,i.setEntryType)(e))}))),[]);const C=(0,n.useCallback)((e=>{y((0,i.selectByNames)(e.detail.value))}),[]),w=(0,n.useCallback)((e=>{y((0,i.selectTestConnectionByNames)(e.detail.value))}),[]),I=(0,n.useCallback)((()=>{console.log("checkData to be posted",o),e===c.SharedNs.VscodeCommandPayloadEntryType.PostmanConvertDocument?l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.postmanDoneConvertDocument,{items:o,selectedItemForTestConnection:A[0]}):l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.postmanSelectRequests,{items:o}),l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.webviewLifecycle,{type:"close"})}),[o,A,e]),R=(0,n.useCallback)((()=>{y(O?(0,i.deselectAll)():(0,i.selectAll)()),g(!O)}),[O]);return(0,n.useEffect)((()=>{l.UtilsNs.notifyVscodeExtension(c.SharedNs.WebviewCommandEnum.postmanSelectReady,{isReady:!0})}),[]),(0,n.useEffect)((()=>{const e=Object.values(b.details).map((e=>e.map((e=>e)))).reduce(((e,t)=>e.concat(t)),[]);j(e)}),[b]),(0,a.jsxs)(u,{children:[e!==c.SharedNs.VscodeCommandPayloadEntryType.PostmanConvertDocument&&(0,a.jsx)("h2",{children:"Select the request(s) you want to add to the adapter definition document."}),e===c.SharedNs.VscodeCommandPayloadEntryType.PostmanConvertDocument&&(0,a.jsx)("h2",{children:"Select the request(s) you want to convert to the adapter definition document."}),(0,a.jsxs)(f,{children:["You have selected ",o.length," requests to convert."]}),!!A.length&&(0,a.jsxs)(f,{children:["The request for testing connection: ",A[0]]}),(0,a.jsx)(p,{children:(0,a.jsx)("oj-button",Object.assign({onClick:I,disabled:!b.valid},{children:"Done"}))}),!b.valid&&(0,a.jsx)(h,{children:(0,a.jsx)("oj-messages",{messages:E,position:null,display:"general",displayOptions:{category:"none"}})}),(0,a.jsx)(m,{children:(0,a.jsx)("oj-checkboxset",Object.assign({value:[O],onClick:R},{children:(0,a.jsx)("oj-option",Object.assign({value:!0},{children:"Select All"}))}))}),(0,a.jsx)("oj-tree-view",{id:"select_requests",data:P,selectionMode:"multiple","aria-label":"All Postman requests",onselectionChanged:C,selection:d,item:{renderer:({data:e})=>({insert:e.title})}}),e===c.SharedNs.VscodeCommandPayloadEntryType.PostmanConvertDocument&&(0,a.jsxs)("oj-collapsible",{children:[(0,a.jsxs)("h5",Object.assign({slot:"header"},{children:[!!A.length&&(0,a.jsxs)("span",{children:["The request for testing connection: ",A[0]]}),!A.length&&(0,a.jsx)("span",{children:"(Optional) Pick a request for test connection."})]})),(0,a.jsx)("oj-tree-view",{id:"select_request_for_test_conn",data:P,selectionMode:"single","aria-label":"All Postman requests",onselectionChanged:w,selection:A,item:{renderer:({data:e})=>({insert:e.title})}})]})]})}}.apply(t,n),void 0===s||(e.exports=s)},7365:function(e,t,a){var n,s,o=this&&this.__awaiter||function(e,t,a,n){return new(a||(a=Promise))((function(s,o){function l(e){try{d(n.next(e))}catch(e){o(e)}}function c(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?s(e.value):(t=e.value,t instanceof a?t:new a((function(e){e(t)}))).then(l,c)}d((n=n.apply(e,t||[])).next())}))};n=[a,t,a(3629),a(9338)],s=function(e,t,a,n){"use strict";var s;Object.defineProperty(t,"__esModule",{value:!0}),t.selectPostmanValidity=t.selectADD=t.selectPostmanCheckedForTestConnection=t.selectPostmanCheckedWithParentNodes=t.selectPostmanChecked=t.selectEntryType=t.selectPostmanSelect=t.deselectAll=t.selectAll=t.setEntryType=t.updatePostmanRawData=t.selectTestConnectionByNames=t.selectByNames=t.postmanSelectSlice=t.getPostmanDataAsync=t.MAX_POSTMAN_REQUEST_COUNT=void 0,t.MAX_POSTMAN_REQUEST_COUNT=200;const l={entryType:n.SharedNs.VscodeCommandPayloadEntryType.PostmanAddRequest,status:"idle"};t.getPostmanDataAsync=(0,a.createAsyncThunk)("postmanSelect/getPostmanRawData",(()=>o(void 0,void 0,void 0,(function*(){return{}}))));const c=(e,t,a)=>{var n;const s=void 0!==a;var o=!!e.name&&(!!t[e.name]!==e.isSelected||s);o&&(e.isSelected=s?a:!!t[e.name]),(o||s)&&(null===(n=e.item)||void 0===n||n.forEach((e=>{delete t[e.name]}))),e.item&&e.item.forEach((n=>c(n,t,s?a:o?e.isSelected:void 0)))},d=(e,t)=>{e.item?e.item.forEach((e=>d(e,t))):e.isSelectedForTestConnection=!!t[e.name]},i=(e,t)=>{e.isSelected=t,e.item&&e.item.forEach((e=>i(e,t)))},r=(e,t)=>{e.value=t.payload.postman,e.addValue=t.payload.add};t.postmanSelectSlice=(0,a.createSlice)({name:"postmanSelect",initialState:l,reducers:{selectByNames:(e,t)=>{c(e.value,Object.fromEntries(t.payload.map((e=>[e,!0]))))},selectTestConnectionByNames:(e,t)=>{d(e.value,Object.fromEntries(t.payload.map((e=>[e,!0]))))},selectAll:(e,t)=>{i(e.value,!0)},deselectAll:(e,t)=>{i(e.value,!1)},updatePostmanRawData:(e,t)=>{r(e,t)},setEntryType:(e,t)=>{e.entryType=t.payload}},extraReducers:e=>{e.addCase(t.getPostmanDataAsync.pending,(e=>{e.status="loading"})).addCase(t.getPostmanDataAsync.fulfilled,((e,t)=>{e.status="idle",r(e,t)})).addCase(t.getPostmanDataAsync.rejected,(e=>{e.status="failed"}))}}),s=t.postmanSelectSlice.actions,t.selectByNames=s.selectByNames,t.selectTestConnectionByNames=s.selectTestConnectionByNames,t.updatePostmanRawData=s.updatePostmanRawData,t.setEntryType=s.setEntryType,t.selectAll=s.selectAll,t.deselectAll=s.deselectAll,t.selectPostmanSelect=e=>e.postmanSelect.value,t.selectEntryType=e=>e.postmanSelect.entryType;const u=(e,t)=>{const a=e.isSelected?[e.name]:[];return e.item?e.item.map((e=>u(e,t))).reduce(((e,t)=>[...e,...t]),t?a:[]):a},p=e=>{const t=e.isSelectedForTestConnection?[e.name]:[];return e.item?e.item.map((e=>p(e))).reduce(((e,t)=>[...e,...t]),[]):t};t.selectPostmanChecked=(0,a.createSelector)(t.selectPostmanSelect,(e=>e?u(e):[])),t.selectPostmanCheckedWithParentNodes=(0,a.createSelector)(t.selectPostmanSelect,(e=>e?u(e,!0):[])),t.selectPostmanCheckedForTestConnection=(0,a.createSelector)(t.selectPostmanSelect,(e=>e?p(e):[])),t.selectADD=e=>e.postmanSelect.addValue,t.selectPostmanValidity=(0,a.createSelector)(t.selectPostmanChecked,t.selectADD,((e,a)=>{const n={valid:!1,details:{}};let s=0;return(null==a?void 0:a.actions)&&(s=Object.keys(a.actions).length),e.length+s>t.MAX_POSTMAN_REQUEST_COUNT&&(n.details.MAX_POSTMAN_REQUEST_COUNT=[{severity:"error",summary:`You can at most select ${t.MAX_POSTMAN_REQUEST_COUNT-s} requests. ${s>0?`You already have ${s} requests in the ADD to be updated. The maximum requests allowed is ${t.MAX_POSTMAN_REQUEST_COUNT}.`:""}`}]),0===e.length&&(n.details.MAX_POSTMAN_REQUEST_COUNT=[{severity:"info",summary:"Select one or more postman requests"}]),n.valid=!Object.keys(n.details).length,n})),t.default=t.postmanSelectSlice.reducer}.apply(t,n),void 0===s||(e.exports=s)},5540:(e,t,a)=>{var n,s;n=[a,t,a(8661),a(4343),a(3774),a(9338),a(583)],s=function(e,t,a,n,s,o,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.RabAdd=void 0,t.RabAdd=function(){const e=(0,n.useAppSelector)(l.selectRabAdd),t=(0,n.useAppSelector)(l.selectRabAddDraft),c=(0,n.useAppSelector)(l.selectVsCodeEditorConfig),d=(0,n.useAppSelector)(l.selectRabAddStatus),i=(0,n.useAppDispatch)();return(0,a.useEffect)((()=>{console.log("[RabAdd] data changed.",e)}),[e]),(0,a.useEffect)((()=>{"saving"===d&&t&&s.UtilsNs.notifyVscodeExtension(o.SharedNs.WebviewCommandEnum.rabAddSave,{addToSave:t,vsCodeEditorConfig:c})}),[d,t,c]),(0,a.useEffect)((()=>{window.vscode===window&&i((0,l.getRabAddDataAsync)())}),[]),(0,a.useEffect)((()=>s.UtilsNs.listenVscodeExtension(o.SharedNs.ExtensionCommandEnum.loadRabAddData,(e=>{e?i((0,l.loadRabAddData)(e)):console.error("[RabAdd] rabAddData must be set")}))),[]),(0,a.useEffect)((()=>{s.UtilsNs.notifyVscodeExtension(o.SharedNs.WebviewCommandEnum.rabAddReady,{isReady:!0})}),[]),null}}.apply(t,n),void 0===s||(e.exports=s)},583:function(e,t,a){var n,s,o=this&&this.__awaiter||function(e,t,a,n){return new(a||(a=Promise))((function(s,o){function l(e){try{d(n.next(e))}catch(e){o(e)}}function c(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?s(e.value):(t=e.value,t instanceof a?t:new a((function(e){e(t)}))).then(l,c)}d((n=n.apply(e,t||[])).next())}))};n=[a,t,a(3629)],s=function(e,t,a){"use strict";var n;Object.defineProperty(t,"__esModule",{value:!0}),t.selectRabAddStatus=t.selectVsCodeEditorConfig=t.selectRabAddDraft=t.selectRabAdd=t.saveRabAddData=t.loadRabAddData=t.rabAddSlice=t.getRabAddDataAsync=void 0,t.getRabAddDataAsync=(0,a.createAsyncThunk)("rabAdd/load",(()=>o(void 0,void 0,void 0,(function*(){return{}})))),t.rabAddSlice=(0,a.createSlice)({name:"rabAdd",initialState:{status:"idle"},reducers:{loadRabAddData:(e,t)=>{e.draft=e.value=t.payload,e.status="idle"},saveRabAddData:(e,t)=>{e.draft=t.payload.add,e.draftString=t.payload.addString,e.vsCodeEditorConfig=t.payload.editorConfig,e.status="saving"}},extraReducers:e=>{e.addCase(t.getRabAddDataAsync.pending,(e=>{e.status="loading"})).addCase(t.getRabAddDataAsync.fulfilled,((e,t)=>{e.status="idle",e.value=t.payload,e.draft=e.value=t.payload})).addCase(t.getRabAddDataAsync.rejected,(e=>{e.status="failed"}))}}),n=t.rabAddSlice.actions,t.loadRabAddData=n.loadRabAddData,t.saveRabAddData=n.saveRabAddData,t.selectRabAdd=e=>e.rabAdd.value,t.selectRabAddDraft=e=>e.rabAdd.draft,t.selectVsCodeEditorConfig=e=>e.rabAdd.vsCodeEditorConfig,t.selectRabAddStatus=e=>e.rabAdd.status,t.default=t.rabAddSlice.reducer}.apply(t,n),void 0===s||(e.exports=s)},8460:(e,t,a)=>{var n,s;n=[a,t,a(8990)],void 0===(s=function(e,t){}.apply(t,n))||(e.exports=s)},3774:(e,t,a)=>{var n;n=function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.UtilsNs=void 0;const a=window.vscode||(window.acquireVsCodeApi?window.acquireVsCodeApi():window.parent||window);var n;window.vscode=a,(n=t.UtilsNs||(t.UtilsNs={})).notifyVscodeExtension=(e,t)=>{window.vscode.postMessage({target:"vscode",command:e,payload:t},"*")},n.listenVscodeExtension=(e,t)=>{const a=a=>{var n,s;if("webview"!==(null===(n=a.data)||void 0===n?void 0:n.target))return;const{command:o,payload:l}=null!==(s=a.data)&&void 0!==s?s:{};o===e&&t(l)};return window.addEventListener("message",a),()=>window.removeEventListener("message",a)}}.apply(t,[a,t]),void 0===n||(e.exports=n)},9338:(e,t,a)=>{var n;n=function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.RabAddUtilNs=t.SharedNs=void 0,function(e){let t,a;e.ADDJsonStringify=e=>JSON.stringify(e,null,2),e.WebviewCommandEnum={webviewRouterReady:"webviewRouterReady",webviewLifecycle:"webviewLifecycle",postmanSelectRequests:"postmanSelectRequests",postmanDoneConvertDocument:"postmanDoneConvertDocument",postmanSelectReady:"postmanSelectReady",openAPISelectRequests:"openAPISelectRequests",openAPISelectReady:"openAPISelectReady",openAPIDoneConvertDocument:"openAPIDoneConvertDocument",rabAddReady:"rabAddReady",rabAddSave:"rabAddSave"},e.ExtensionCommandEnum={openCopilotPostmanConvert:"orab.webview.copilot.open.postman.convert",openPostmanConvertConverDocument:"orab.convert.postman.document",openOpenAPIConvertNewDocument:"orab.add.convert",openOpenAPIConvertAppendDocument:"orab.add.convert.append",openCopilotAssistant:"orab.webview.copilot.open.assistant",updatePostmanRawData:"updatePostmanRawData",updateOpenAPIRawData:"updateOpenAPIRawData",updateEntryType:"updateEntryType",loadRabAddData:"loadRabAddData",routerNavigateTo:"routerNavigateTo"},function(e){e.Root="/",e.PostmanAdd="postman/add",e.OpenAPIAdd="openapi/add",e.Copilot="copilot"}(t=e.WebviewRouteEnum||(e.WebviewRouteEnum={})),function(e){e.PostmanConvertDocument="PostmanConvertDocument",e.PostmanAddRequest="PostmanAddRequest",e.OpenAPIConvertDocument="OpenAPIConvertDocument",e.OpenAPIAddRequest="OpenAPIAddRequest"}(a=e.VscodeCommandPayloadEntryType||(e.VscodeCommandPayloadEntryType={}))}(t.SharedNs||(t.SharedNs={})),(t.RabAddUtilNs||(t.RabAddUtilNs={})).flowPrefix="flow:"}.apply(t,[a,t]),void 0===n||(e.exports=n)}},e=>{e.O(0,[412],(()=>(8460,e(e.s=8460)))),e.O()}]);
//# sourceMappingURL=main.d7ada578f1175f12b09b.js.map