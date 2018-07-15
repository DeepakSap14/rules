/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Component, ViewEncapsulation } from '@angular/core';
import { Environment } from '@aribaui/core';
import { DomHandler } from 'primeng/primeng';
import { DTColumn2Component } from '../dt-column.component';
/**
 *
 * Column implementation for the Multiselection where we show checkbox control
 *
 *
 */
var DTMultiSelectColumnComponent = /** @class */ (function (_super) {
    tslib_1.__extends(DTMultiSelectColumnComponent, _super);
    function DTMultiSelectColumnComponent(env, domHandler) {
        var _this = _super.call(this, env, domHandler) || this;
        _this.env = env;
        _this.domHandler = domHandler;
        // default width of the selection control
        // default width of the selection control
        _this.width = '45px';
        return _this;
    }
    DTMultiSelectColumnComponent.decorators = [
        { type: Component, args: [{
                    selector: 'aw-dt-multi-select-column',
                    template: "<!--\n    Manages multi selection and renders checkboxes both for header in case [showSelectAll] is\n    enabled as well as each checkbox per row\n-->\n<ng-template #renderingTemplate let-isHeader let-isSubHeader=\"isSubHeader\" let-column=\"column\"\n             let-dataToRender=\"data\"\n             let-level=\"nestingLevel\"\n             let-columnIndex=\"columnIndex\"\n             let-rowIndex=\"rowIndex\">\n\n    <ng-template *ngIf=\"isHeader\" [ngTemplateOutlet]=\"colHeader\"\n                 [ngTemplateOutletContext]=\"{$implicit: isSubHeader, columnIndex:columnIndex,\n                 level:level}\">\n    </ng-template>\n\n    <ng-template *ngIf=\"!isHeader\" [ngTemplateOutlet]=\"colBody\"\n                 [ngTemplateOutletContext]=\"{$implicit: column, level:level,\n                    data:dataToRender,rowIndex:rowIndex}\">\n    </ng-template>\n</ng-template>\n\n\n<ng-template #colHeader let-isSubHeader let-columnIndex=\"columnIndex\">\n    <th [ngClass]=\"{'dt-is-default dt-u-unselectable-text dt-selection-column' :true,\n                    'dt-cell-def': true,\n                    'dt-sub-header': isSubHeader,\n                    'dt-is-hidden': !dt.showSelectionColumn}\" align=\"center\">\n\n        <ng-template [ngIf]=\"dt.showSelectAll\">\n            <aw-checkbox [type]=\"'action'\" (action)=\"dt.toggleAllColumns($event)\"\n                         [value]=\"dt.isToggleAllColumnSelected()\"\n                         [disabled]=\"dt.isToggleAllColumnDisabled()\">\n            </aw-checkbox>\n        </ng-template>\n\n        <ng-template [ngIf]=\"!dt.showSelectAll\">&nbsp;\n        </ng-template>\n    </th>\n\n</ng-template>\n\n\n<ng-template #colBody let-data=\"data\" let-rowIndex=\"rowIndex\" , let-level=\"level\">\n\n    <td #cell [class]=\"dynamicBodyClass(data)\"\n        [style.padding-left.px]=\"indentForControl(cell, level)\"\n        align=\"center\"\n        [ngClass]=\"{ 'dt-is-default dt-selection-column': true,\n        'dt-cell-def': true,\n        'dt-is-hidden': !dt.showSelectionColumn}\">\n\n        <aw-checkbox [type]=\"'action'\" [value]=\"dt.isRowSelected(data)\">\n        </aw-checkbox>\n\n    </td>\n</ng-template>\n",
                    styles: [""],
                    encapsulation: ViewEncapsulation.None,
                    providers: [DomHandler]
                },] },
    ];
    /** @nocollapse */
    DTMultiSelectColumnComponent.ctorParameters = function () { return [
        { type: Environment },
        { type: DomHandler }
    ]; };
    return DTMultiSelectColumnComponent;
}(DTColumn2Component));
export { DTMultiSelectColumnComponent };
function DTMultiSelectColumnComponent_tsickle_Closure_declarations() {
    /** @type {?} */
    DTMultiSelectColumnComponent.prototype.env;
    /** @type {?} */
    DTMultiSelectColumnComponent.prototype.domHandler;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHQtbXVsdGktc2VsZWN0LWNvbHVtbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYXJpYmF1aS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9kYXRhdGFibGUyL2NvbHVtbi9tdWx0aS1zZWxlY3QvZHQtbXVsdGktc2VsZWN0LWNvbHVtbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFvQkEsT0FBTyxFQUFDLFNBQVMsRUFBa0MsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0YsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7Ozs7Ozs7O0lBeUVSLHdEQUFrQjtJQUdoRSxzQ0FBbUIsR0FBZ0IsRUFBUyxVQUFzQjtRQUFsRSxZQUVJLGtCQUFNLEdBQUcsRUFBRSxVQUFVLENBQUMsU0FJekI7UUFOa0IsU0FBRyxHQUFILEdBQUcsQ0FBYTtRQUFTLGdCQUFVLEdBQVYsVUFBVSxDQUFZOztRQUs5RCxBQURBLHlDQUF5QztRQUN6QyxLQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQzs7S0FDdkI7O2dCQXpFSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLDJCQUEyQjtvQkFDckMsUUFBUSxFQUFFLHdwRUF3RGI7b0JBQ0csTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUNaLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO29CQUNyQyxTQUFTLEVBQUUsQ0FBQyxVQUFVLENBQUM7aUJBRTFCOzs7O2dCQTFFTyxXQUFXO2dCQUNYLFVBQVU7O3VDQXZCbEI7RUFpR2tELGtCQUFrQjtTQUF2RCw0QkFBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgU0FQIEFyaWJhXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqXG4gKi9cbmltcG9ydCB7Q29tcG9uZW50LCBFbGVtZW50UmVmLCBmb3J3YXJkUmVmLCBJbmplY3QsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGF0YXRhYmxlMkNvbXBvbmVudH0gZnJvbSAnLi4vLi4vZGF0YXRhYmxlMi5jb21wb25lbnQnO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSAnQGFyaWJhdWkvY29yZSc7XG5pbXBvcnQge0RvbUhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvcHJpbWVuZyc7XG5pbXBvcnQge0RUQ29sdW1uMkNvbXBvbmVudH0gZnJvbSAnLi4vZHQtY29sdW1uLmNvbXBvbmVudCc7XG5cblxuLyoqXG4gKlxuICogQ29sdW1uIGltcGxlbWVudGF0aW9uIGZvciB0aGUgTXVsdGlzZWxlY3Rpb24gd2hlcmUgd2Ugc2hvdyBjaGVja2JveCBjb250cm9sXG4gKlxuICpcbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhdy1kdC1tdWx0aS1zZWxlY3QtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogYDwhLS1cbiAgICBNYW5hZ2VzIG11bHRpIHNlbGVjdGlvbiBhbmQgcmVuZGVycyBjaGVja2JveGVzIGJvdGggZm9yIGhlYWRlciBpbiBjYXNlIFtzaG93U2VsZWN0QWxsXSBpc1xuICAgIGVuYWJsZWQgYXMgd2VsbCBhcyBlYWNoIGNoZWNrYm94IHBlciByb3dcbi0tPlxuPG5nLXRlbXBsYXRlICNyZW5kZXJpbmdUZW1wbGF0ZSBsZXQtaXNIZWFkZXIgbGV0LWlzU3ViSGVhZGVyPVwiaXNTdWJIZWFkZXJcIiBsZXQtY29sdW1uPVwiY29sdW1uXCJcbiAgICAgICAgICAgICBsZXQtZGF0YVRvUmVuZGVyPVwiZGF0YVwiXG4gICAgICAgICAgICAgbGV0LWxldmVsPVwibmVzdGluZ0xldmVsXCJcbiAgICAgICAgICAgICBsZXQtY29sdW1uSW5kZXg9XCJjb2x1bW5JbmRleFwiXG4gICAgICAgICAgICAgbGV0LXJvd0luZGV4PVwicm93SW5kZXhcIj5cblxuICAgIDxuZy10ZW1wbGF0ZSAqbmdJZj1cImlzSGVhZGVyXCIgW25nVGVtcGxhdGVPdXRsZXRdPVwiY29sSGVhZGVyXCJcbiAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInskaW1wbGljaXQ6IGlzU3ViSGVhZGVyLCBjb2x1bW5JbmRleDpjb2x1bW5JbmRleCxcbiAgICAgICAgICAgICAgICAgbGV2ZWw6bGV2ZWx9XCI+XG4gICAgPC9uZy10ZW1wbGF0ZT5cblxuICAgIDxuZy10ZW1wbGF0ZSAqbmdJZj1cIiFpc0hlYWRlclwiIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImNvbEJvZHlcIlxuICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwieyRpbXBsaWNpdDogY29sdW1uLCBsZXZlbDpsZXZlbCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTpkYXRhVG9SZW5kZXIscm93SW5kZXg6cm93SW5kZXh9XCI+XG4gICAgPC9uZy10ZW1wbGF0ZT5cbjwvbmctdGVtcGxhdGU+XG5cblxuPG5nLXRlbXBsYXRlICNjb2xIZWFkZXIgbGV0LWlzU3ViSGVhZGVyIGxldC1jb2x1bW5JbmRleD1cImNvbHVtbkluZGV4XCI+XG4gICAgPHRoIFtuZ0NsYXNzXT1cInsnZHQtaXMtZGVmYXVsdCBkdC11LXVuc2VsZWN0YWJsZS10ZXh0IGR0LXNlbGVjdGlvbi1jb2x1bW4nIDp0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZHQtY2VsbC1kZWYnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZHQtc3ViLWhlYWRlcic6IGlzU3ViSGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAnZHQtaXMtaGlkZGVuJzogIWR0LnNob3dTZWxlY3Rpb25Db2x1bW59XCIgYWxpZ249XCJjZW50ZXJcIj5cblxuICAgICAgICA8bmctdGVtcGxhdGUgW25nSWZdPVwiZHQuc2hvd1NlbGVjdEFsbFwiPlxuICAgICAgICAgICAgPGF3LWNoZWNrYm94IFt0eXBlXT1cIidhY3Rpb24nXCIgKGFjdGlvbik9XCJkdC50b2dnbGVBbGxDb2x1bW5zKCRldmVudClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgIFt2YWx1ZV09XCJkdC5pc1RvZ2dsZUFsbENvbHVtblNlbGVjdGVkKClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgIFtkaXNhYmxlZF09XCJkdC5pc1RvZ2dsZUFsbENvbHVtbkRpc2FibGVkKClcIj5cbiAgICAgICAgICAgIDwvYXctY2hlY2tib3g+XG4gICAgICAgIDwvbmctdGVtcGxhdGU+XG5cbiAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ0lmXT1cIiFkdC5zaG93U2VsZWN0QWxsXCI+Jm5ic3A7XG4gICAgICAgIDwvbmctdGVtcGxhdGU+XG4gICAgPC90aD5cblxuPC9uZy10ZW1wbGF0ZT5cblxuXG48bmctdGVtcGxhdGUgI2NvbEJvZHkgbGV0LWRhdGE9XCJkYXRhXCIgbGV0LXJvd0luZGV4PVwicm93SW5kZXhcIiAsIGxldC1sZXZlbD1cImxldmVsXCI+XG5cbiAgICA8dGQgI2NlbGwgW2NsYXNzXT1cImR5bmFtaWNCb2R5Q2xhc3MoZGF0YSlcIlxuICAgICAgICBbc3R5bGUucGFkZGluZy1sZWZ0LnB4XT1cImluZGVudEZvckNvbnRyb2woY2VsbCwgbGV2ZWwpXCJcbiAgICAgICAgYWxpZ249XCJjZW50ZXJcIlxuICAgICAgICBbbmdDbGFzc109XCJ7ICdkdC1pcy1kZWZhdWx0IGR0LXNlbGVjdGlvbi1jb2x1bW4nOiB0cnVlLFxuICAgICAgICAnZHQtY2VsbC1kZWYnOiB0cnVlLFxuICAgICAgICAnZHQtaXMtaGlkZGVuJzogIWR0LnNob3dTZWxlY3Rpb25Db2x1bW59XCI+XG5cbiAgICAgICAgPGF3LWNoZWNrYm94IFt0eXBlXT1cIidhY3Rpb24nXCIgW3ZhbHVlXT1cImR0LmlzUm93U2VsZWN0ZWQoZGF0YSlcIj5cbiAgICAgICAgPC9hdy1jaGVja2JveD5cblxuICAgIDwvdGQ+XG48L25nLXRlbXBsYXRlPlxuYCxcbiAgICBzdHlsZXM6IFtgYF0sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgICBwcm92aWRlcnM6IFtEb21IYW5kbGVyXVxuXG59KVxuZXhwb3J0IGNsYXNzIERUTXVsdGlTZWxlY3RDb2x1bW5Db21wb25lbnQgZXh0ZW5kcyBEVENvbHVtbjJDb21wb25lbnRcbntcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbnY6IEVudmlyb25tZW50LCBwdWJsaWMgZG9tSGFuZGxlcjogRG9tSGFuZGxlcilcbiAgICB7XG4gICAgICAgIHN1cGVyKGVudiwgZG9tSGFuZGxlcik7XG5cbiAgICAgICAgLy8gZGVmYXVsdCB3aWR0aCBvZiB0aGUgc2VsZWN0aW9uIGNvbnRyb2xcbiAgICAgICAgdGhpcy53aWR0aCA9ICc0NXB4JztcbiAgICB9XG5cbn1cblxuIl19