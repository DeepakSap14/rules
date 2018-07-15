/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright 2017 SAP Ariba
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */
export { AppConfig, makeConfig } from './config/app-config';
export { Environment } from './config/environment';
export { Resource } from './domain/resource.service';
export { DefaultRestBuilder } from './domain/url/builder';
export { isEntity, isValue } from './domain/domain-model';
export { ActionSegment, RestAction, ResourceSegment, RestSegmentType, UrlSegment, ContextSegment, HostSegment, IdentifierSegment, OfParentSegment } from './domain/url/segment';
export { RestUrlGroup } from './domain/url/url-group';
export { MapWrapper, StringMapWrapper, ListWrapper, isListLikeIterable, areIterablesEqual, iterateListLike, findLast } from './utils/collection';
export { getTypeNameForDebugging, unimplemented, isPresent, isBlank, isBoolean, isNumber, isString, isFunction, isType, isStringMap, isStrictStringMap, isPromise, isArray, isDate, isWindow, isRegExp, noop, stringify, className, applyMixins, StringWrapper, StringJoiner, NumberWrapper, FunctionWrapper, looseIdentical, getMapKey, normalizeBlank, normalizeBool, isJsObject, print, warn, assert, checksum, crc32, Json, DateWrapper, BooleanWrapper, getSymbolIterator, evalExpression, evalExpressionWithCntx, isPrimitive, hasConstructor, escape, escapeRegExp, hashCode, objectToName, equals, shiftLeft, shiftRight, Extensible, readGlobalParam, decamelize, nonPrivatePrefix, hasGetter, uuid, objectValues } from './utils/lang';
export { NotFoundComponent } from './not-found/not-found.component';
export { RoutingService } from './routing/routing.service';
export { AribaCoreModule } from './ariba.core.module';
export { FieldPath } from './utils/field-path';
export { AribaApplication } from './ariba-application';
export { Notifications } from './messaging/notifications.service';

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljX2FwaS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhcmliYXVpL2NvcmUvIiwic291cmNlcyI6WyJwdWJsaWNfYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QkEsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMxRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFakQsT0FBTyxFQUFXLFFBQVEsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzdELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFDSCxRQUFRLEVBQTBELE9BQU8sRUFDNUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQ0gsYUFBYSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQ3ZGLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQ2xELE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRXBELE9BQU8sRUFDSCxVQUFVLEVBQUUsZ0JBQWdCLEVBQWEsV0FBVyxFQUFFLGtCQUFrQixFQUN4RSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUMvQyxNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sRUFDSCx1QkFBdUIsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFDekYsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUN4RixRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQzlFLGFBQWEsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQ3pFLGFBQWEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUNsRixjQUFjLEVBQUUsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLHNCQUFzQixFQUN6RSxXQUFXLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQ2pGLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQ2hGLFNBQVMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUNoQyxNQUFNLGNBQWMsQ0FBQztBQUd0QixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNsRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFekQsT0FBTyxFQUNILGVBQWUsRUFDbEIsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFN0MsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1DQUFtQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgU0FQIEFyaWJhXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuXG4vKlxuICogUHVibGljIEFQSSBTdXJmYWNlIG9mIGNvcmVcbiAqL1xuXG5leHBvcnQge0FwcENvbmZpZywgbWFrZUNvbmZpZ30gZnJvbSAnLi9jb25maWcvYXBwLWNvbmZpZyc7XG5leHBvcnQge0Vudmlyb25tZW50fSBmcm9tICcuL2NvbmZpZy9lbnZpcm9ubWVudCc7XG5cbmV4cG9ydCB7UmVzcG9uc2UsIFJlc291cmNlfSBmcm9tICcuL2RvbWFpbi9yZXNvdXJjZS5zZXJ2aWNlJztcbmV4cG9ydCB7RGVmYXVsdFJlc3RCdWlsZGVyfSBmcm9tICcuL2RvbWFpbi91cmwvYnVpbGRlcic7XG5leHBvcnQge1xuICAgIGlzRW50aXR5LCBWYWx1ZSwgRW50aXR5LCBJZGVudGl0eSwgQ29tcG9zaXRlVHlwZSwgRGVzZXJpYWxpemFibGUsIGlzVmFsdWVcbn0gZnJvbSAnLi9kb21haW4vZG9tYWluLW1vZGVsJztcbmV4cG9ydCB7XG4gICAgQWN0aW9uU2VnbWVudCwgUmVzdEFjdGlvbiwgUmVzb3VyY2VTZWdtZW50LCBSZXN0U2VnbWVudFR5cGUsIFVybFNlZ21lbnQsIENvbnRleHRTZWdtZW50LFxuICAgIEhvc3RTZWdtZW50LCBJZGVudGlmaWVyU2VnbWVudCwgT2ZQYXJlbnRTZWdtZW50XG59IGZyb20gJy4vZG9tYWluL3VybC9zZWdtZW50JztcbmV4cG9ydCB7UmVzdFVybEdyb3VwfSBmcm9tICcuL2RvbWFpbi91cmwvdXJsLWdyb3VwJztcblxuZXhwb3J0IHtcbiAgICBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyLCBQcmVkaWNhdGUsIExpc3RXcmFwcGVyLCBpc0xpc3RMaWtlSXRlcmFibGUsXG4gICAgYXJlSXRlcmFibGVzRXF1YWwsIGl0ZXJhdGVMaXN0TGlrZSwgZmluZExhc3Rcbn0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uJztcbmV4cG9ydCB7XG4gICAgZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcsIHVuaW1wbGVtZW50ZWQsIGlzUHJlc2VudCwgaXNCbGFuaywgaXNCb29sZWFuLCBpc051bWJlciwgaXNTdHJpbmcsXG4gICAgaXNGdW5jdGlvbiwgaXNUeXBlLCBpc1N0cmluZ01hcCwgaXNTdHJpY3RTdHJpbmdNYXAsIGlzUHJvbWlzZSwgaXNBcnJheSwgaXNEYXRlLCBpc1dpbmRvdyxcbiAgICBpc1JlZ0V4cCwgbm9vcCwgc3RyaW5naWZ5LCBjbGFzc05hbWUsIGFwcGx5TWl4aW5zLCBTdHJpbmdXcmFwcGVyLCBTdHJpbmdKb2luZXIsXG4gICAgTnVtYmVyV3JhcHBlciwgRnVuY3Rpb25XcmFwcGVyLCBsb29zZUlkZW50aWNhbCwgZ2V0TWFwS2V5LCBub3JtYWxpemVCbGFuayxcbiAgICBub3JtYWxpemVCb29sLCBpc0pzT2JqZWN0LCBwcmludCwgd2FybiwgYXNzZXJ0LCBjaGVja3N1bSwgY3JjMzIsIEpzb24sIERhdGVXcmFwcGVyLFxuICAgIEJvb2xlYW5XcmFwcGVyLCBnZXRTeW1ib2xJdGVyYXRvciwgZXZhbEV4cHJlc3Npb24sIGV2YWxFeHByZXNzaW9uV2l0aENudHgsXG4gICAgaXNQcmltaXRpdmUsIGhhc0NvbnN0cnVjdG9yLCBlc2NhcGUsIGVzY2FwZVJlZ0V4cCwgaGFzaENvZGUsIG9iamVjdFRvTmFtZSwgZXF1YWxzLFxuICAgIHNoaWZ0TGVmdCwgc2hpZnRSaWdodCwgRXh0ZW5zaWJsZSwgcmVhZEdsb2JhbFBhcmFtLCBkZWNhbWVsaXplLCBub25Qcml2YXRlUHJlZml4LFxuICAgIGhhc0dldHRlciwgdXVpZCwgb2JqZWN0VmFsdWVzXG59IGZyb20gJy4vdXRpbHMvbGFuZyc7XG5cblxuZXhwb3J0IHtOb3RGb3VuZENvbXBvbmVudH0gZnJvbSAnLi9ub3QtZm91bmQvbm90LWZvdW5kLmNvbXBvbmVudCc7XG5leHBvcnQge1JvdXRpbmdTZXJ2aWNlfSBmcm9tICcuL3JvdXRpbmcvcm91dGluZy5zZXJ2aWNlJztcblxuZXhwb3J0IHtcbiAgICBBcmliYUNvcmVNb2R1bGVcbn0gZnJvbSAnLi9hcmliYS5jb3JlLm1vZHVsZSc7XG5cbmV4cG9ydCB7RmllbGRQYXRofSBmcm9tICcuL3V0aWxzL2ZpZWxkLXBhdGgnO1xuXG5leHBvcnQge0FyaWJhQXBwbGljYXRpb259IGZyb20gJy4vYXJpYmEtYXBwbGljYXRpb24nO1xuZXhwb3J0IHtOb3RpZmljYXRpb25zfSBmcm9tICcuL21lc3NhZ2luZy9ub3RpZmljYXRpb25zLnNlcnZpY2UnO1xuXG4iXX0=