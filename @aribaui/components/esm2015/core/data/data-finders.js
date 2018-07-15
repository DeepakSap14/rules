/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from '@angular/core';
import { assert, FieldPath, isArray, isBlank, isFunction, isJsObject, isPresent, objectToName, objectValues, unimplemented } from '@aribaui/core';
import { of as observableOf } from 'rxjs';
import { ArrayDataProvider } from './array-data-provider';
/**
 *
 * Provides a registry of different data Finders used mostly by DataSources. All Finders are
 * registered by this class as we don't have any needs right now to expose this to developer.
 *
 */
export class DataFinders {
    constructor() {
        this.findersByType = new Map();
        this.initFinders();
    }
    /**
     * Finds the best matching DataFinder based on the object type and queryType.
     * @param {?} forProvider
     * @param {?} forType
     * @return {?}
     */
    find(forProvider, forType) {
        let /** @type {?} */ finderMatch;
        this.findersByType.forEach((v, k) => {
            if (k.accepts(forProvider, forType)) {
                finderMatch = v;
                return true;
            }
        });
        if (isPresent(finderMatch)) {
            let /** @type {?} */ copy = new finderMatch();
            copy.forData(forProvider);
            return copy;
        }
        return null;
    }
    /**
     * Registers new finder
     *
     * @template T
     * @param {?} prototype
     * @param {?} type
     * @return {?}
     */
    register(prototype, type) {
        this.findersByType.set(prototype, type);
    }
    /**
     * @return {?}
     */
    initFinders() {
        // create a prototype for each
        this.findersByType.set(new FullTextArrayDataFinder(), FullTextArrayDataFinder);
        this.findersByType.set(new OutlineFullTextArrayDataFinder(), OutlineFullTextArrayDataFinder);
    }
}
DataFinders.decorators = [
    { type: Injectable },
];
/** @nocollapse */
DataFinders.ctorParameters = () => [];
function DataFinders_tsickle_Closure_declarations() {
    /** @type {?} */
    DataFinders.prototype.findersByType;
}
/** @enum {number} */
const QueryType = {
    FullText: 0,
    FullTextOutline: 1,
    Predicate: 2,
    FullTextAndPredicate: 3,
};
export { QueryType };
QueryType[QueryType.FullText] = "FullText";
QueryType[QueryType.FullTextOutline] = "FullTextOutline";
QueryType[QueryType.Predicate] = "Predicate";
QueryType[QueryType.FullTextAndPredicate] = "FullTextAndPredicate";
/**
 * This class provides matching capability for given DataProvider.
 * @abstract
 */
export class DataFinder {
    /**
     * In order to find concrete DataFinder we need to know the target type and the query type
     *
     * @param {?} forData
     * @param {?} forType
     * @return {?}
     */
    accepts(forData, forType) {
        return false;
    }
    /**
     *
     * Query can be a simple string literal or a map having different key value pair as a
     * filter
     *
     * @template T
     * @param {?} query
     * @param {?=} max
     * @return {?}
     */
    match(query, max = -1) {
        return unimplemented();
    }
    /**
     * @template T
     * @param {?} selections
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    matchWithSelections(selections, query, max) {
        return unimplemented();
    }
}
function DataFinder_tsickle_Closure_declarations() {
    /**
     *
     * Lookup key to apply when running match. Ideally your DS should be able to set lookupKey
     * either globally for given dataProvider or locally every time you run search. This is in
     * case you have many choosers for the same type and you want them to have different lookup
     * key.
     *
     *
     *
     * @abstract
     * @param {?} key
     * @return {?}
     */
    DataFinder.prototype.lookupKey = function (key) { };
    /**
     *
     * Sets a DataProvider for DataFinder
     *
     * @abstract
     * @param {?} provider
     * @return {?}
     */
    DataFinder.prototype.forData = function (provider) { };
    /**
     *
     * Matching methods which are either async or sync
     *
     * @abstract
     * @template T
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    DataFinder.prototype.instantMatch = function (query, max) { };
    /**
     * @abstract
     * @template T
     * @param {?} selectionsForMatch
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    DataFinder.prototype.instantMatchWithSelections = function (selectionsForMatch, query, max) { };
}
/**
 * Simple FullText implementation based on infix string matching which works on top of
 * ArrayDataProvider.
 *
 */
export class FullTextArrayDataFinder extends DataFinder {
    /**
     * @param {?} key
     * @return {?}
     */
    set lookupKey(key) {
        this._keyPath = isPresent(key) ? new FieldPath(key) : null;
    }
    /**
     * @param {?} forData
     * @param {?} forType
     * @return {?}
     */
    accepts(forData, forType) {
        return forData instanceof ArrayDataProvider && forType === QueryType.FullText;
    }
    /**
     * @param {?} provider
     * @return {?}
     */
    forData(provider) {
        this._provider = provider;
        return this;
    }
    /**
     * @template T
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    instantMatch(query, max) {
        assert(isPresent(this._provider), 'Missing DataProvider');
        let /** @type {?} */ list = this._provider.dataForParams(new Map().set('limit', max));
        return this.instantMatchWithSelections(list, query, max);
    }
    /**
     * @template T
     * @param {?} selectionsForMatch
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    instantMatchWithSelections(selectionsForMatch, query, max) {
        assert(isPresent(this._provider), 'Missing DataProvider');
        if (isBlank(query)) {
            return selectionsForMatch;
        }
        let /** @type {?} */ result = [];
        let /** @type {?} */ toLowerPattern = query.toLowerCase();
        for (let /** @type {?} */ i = 0; i < selectionsForMatch.length; i++) {
            let /** @type {?} */ item = selectionsForMatch[i];
            if (this.matches(item, toLowerPattern)) {
                result.push(item);
                if (result.length >= max) {
                    break;
                }
            }
        }
        return result;
    }
    /**
     *
     * Warning: If you dont supply search Key and you want fulltext search and you use this
     * default implementation be aware that it can  perform poorly as it is naive implementaion
     * that does not do deep compare.
     *
     * @template T
     * @param {?} item
     * @param {?} pattern
     * @return {?}
     */
    matches(item, pattern) {
        let /** @type {?} */ val = (isPresent(this._keyPath)) ? this._keyPath.getFieldValue(item) : item;
        if (isFunction(val)) {
            val = val.call(item);
        }
        else if (isJsObject(item)) {
            return this.hasObjectValue(item, pattern);
        }
        else {
            return isBlank(pattern) ||
                isPresent(val) && val.toString().toLowerCase().indexOf(pattern) > -1;
        }
    }
    /**
     * @template T
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    match(query, max) {
        return observableOf(this.instantMatch(query, max));
    }
    /**
     * @template T
     * @param {?} selections
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    matchWithSelections(selections, query, max) {
        return observableOf(this.instantMatchWithSelections(selections, query, max));
    }
    /**
     * @param {?} obj
     * @param {?} pattern
     * @return {?}
     */
    hasObjectValue(obj, pattern) {
        let /** @type {?} */ values = objectValues(obj);
        let /** @type {?} */ parentObj = objectToName(obj);
        let /** @type {?} */ length2 = values.filter((value) => {
            if (isBlank(value) || isArray(value)) {
                return false;
            }
            else if (!isJsObject(value) && !isFunction(value)) {
                return value.toString().toLowerCase().indexOf(pattern) !== -1;
            }
            else if (isJsObject(value) && objectToName(value) !== parentObj) {
                return this.hasObjectValue(value, pattern);
            }
            return false;
        }).length;
        return length2 > 0;
    }
}
function FullTextArrayDataFinder_tsickle_Closure_declarations() {
    /**
     *  If list value is object set keyPath to get the object value
     * @type {?}
     */
    FullTextArrayDataFinder.prototype._keyPath;
    /**
     * Current DataProvider used to access data
     * @type {?}
     */
    FullTextArrayDataFinder.prototype._provider;
}
/**
 * Extends basic Infix implementation to work on top of OutlineNodes. It first checks all the
 * children on lowest level and moving up to the root and marking nodes that can be removed.
 *
 *  For simple data structure which operates on local array this should be good enough we this
 *  can never match with real DB full text search.
 *
 */
export class OutlineFullTextArrayDataFinder extends FullTextArrayDataFinder {
    /**
     * @param {?} forData
     * @param {?} forType
     * @return {?}
     */
    accepts(forData, forType) {
        return forData instanceof ArrayDataProvider && forType === QueryType.FullTextOutline;
    }
    /**
     * @template T
     * @param {?} selectionsForMatch
     * @param {?} query
     * @param {?} max
     * @return {?}
     */
    instantMatchWithSelections(selectionsForMatch, query, max) {
        assert(isPresent(this._provider), 'Missing DataProvider');
        if (isBlank(query)) {
            return selectionsForMatch;
        }
        let /** @type {?} */ toLowerPattern = query.toLowerCase();
        let /** @type {?} */ sourceToSearch = selectionsForMatch.slice();
        this.rollup(sourceToSearch, toLowerPattern);
        return this.shake(sourceToSearch);
    }
    /**
     *
     * Going thru the tree from bottom up and mark all that matches query
     *
     * @param {?} nodes
     * @param {?} query
     * @return {?}
     */
    rollup(nodes, query) {
        nodes.forEach((item) => {
            // start from bottom up and capture how many occurrences is found for future use
            let /** @type {?} */ hasChildrenMatch = false;
            if (isPresent(item.children) && item.children.length > 0) {
                hasChildrenMatch = this.rollup(item.children, query);
            }
            item.visible = hasChildrenMatch || this.matches(item, query);
        });
        return nodes.some((item) => item.visible);
    }
    /**
     * Filter out all the nodes that are marked as visible = false and make sure and
     * don't modify original list
     *
     * @param {?} nodes
     * @return {?}
     */
    shake(nodes) {
        return nodes
            .filter(node => node.visible)
            .map(node => (Object.assign({}, node, { isExpanded: node.visible, children: node.children && this.shake(node.children) })));
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1maW5kZXJzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFyaWJhdWkvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbImNvcmUvZGF0YS9kYXRhLWZpbmRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQW1CQSxPQUFPLEVBQUMsVUFBVSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFDSCxNQUFNLEVBQ04sU0FBUyxFQUNULE9BQU8sRUFDUCxPQUFPLEVBQ1AsVUFBVSxFQUNWLFVBQVUsRUFDVixTQUFTLEVBQ1QsWUFBWSxFQUNaLFlBQVksRUFDWixhQUFhLEVBQ2hCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBYSxFQUFFLElBQUksWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDOzs7Ozs7O0FBV3hELE1BQU07SUFLRjs2QkFGMkQsSUFBSSxHQUFHLEVBQUU7UUFJaEUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3RCOzs7Ozs7O0lBS0QsSUFBSSxDQUFDLFdBQThCLEVBQUUsT0FBa0I7UUFHbkQscUJBQUksV0FBNkIsQ0FBQztRQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQW1CLEVBQUUsQ0FBYSxFQUFFLEVBQUU7WUFFOUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDO2FBQ2Y7U0FDSixDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLHFCQUFJLElBQUksR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FB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LEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hEO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNoRSxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMxRDs7Ozs7Ozs7SUFPRCxLQUFLLENBQUMsS0FBb0I7UUFFdEIsTUFBTSxDQUFDLEtBQUs7YUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUNOLElBQUksSUFDUCxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFDeEIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQ3RELENBQUMsQ0FBQztLQUNYO0NBRUoiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgU0FQIEFyaWJhXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICovXG5pbXBvcnQge0RhdGFQcm92aWRlcn0gZnJvbSAnLi9kYXRhdHlwZS1yZWdpc3RyeS5zZXJ2aWNlJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICAgIGFzc2VydCxcbiAgICBGaWVsZFBhdGgsXG4gICAgaXNBcnJheSxcbiAgICBpc0JsYW5rLFxuICAgIGlzRnVuY3Rpb24sXG4gICAgaXNKc09iamVjdCxcbiAgICBpc1ByZXNlbnQsXG4gICAgb2JqZWN0VG9OYW1lLFxuICAgIG9iamVjdFZhbHVlcyxcbiAgICB1bmltcGxlbWVudGVkXG59IGZyb20gJ0BhcmliYXVpL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtBcnJheURhdGFQcm92aWRlcn0gZnJvbSAnLi9hcnJheS1kYXRhLXByb3ZpZGVyJztcbmltcG9ydCB7T3V0bGluZU5vZGV9IGZyb20gJy4uLy4uL3dpZGdldHMvb3V0bGluZS9vdXRsaW5lLWZvci5jb21wb25lbnQnO1xuXG5cbi8qKlxuICpcbiAqIFByb3ZpZGVzIGEgcmVnaXN0cnkgb2YgZGlmZmVyZW50IGRhdGEgRmluZGVycyB1c2VkIG1vc3RseSBieSBEYXRhU291cmNlcy4gQWxsIEZpbmRlcnMgYXJlXG4gKiByZWdpc3RlcmVkIGJ5IHRoaXMgY2xhc3MgYXMgd2UgZG9uJ3QgaGF2ZSBhbnkgbmVlZHMgcmlnaHQgbm93IHRvIGV4cG9zZSB0aGlzIHRvIGRldmVsb3Blci5cbiAqXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEYXRhRmluZGVyc1xue1xuXG4gICAgcHJpdmF0ZSBmaW5kZXJzQnlUeXBlOiBNYXA8RGF0YUZpbmRlciwgVHlwZTxEYXRhRmluZGVyPj4gPSBuZXcgTWFwKCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpXG4gICAge1xuICAgICAgICB0aGlzLmluaXRGaW5kZXJzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIGJlc3QgbWF0Y2hpbmcgRGF0YUZpbmRlciBiYXNlZCBvbiB0aGUgb2JqZWN0IHR5cGUgYW5kIHF1ZXJ5VHlwZS5cbiAgICAgKi9cbiAgICBmaW5kKGZvclByb3ZpZGVyOiBEYXRhUHJvdmlkZXI8YW55PiwgZm9yVHlwZTogUXVlcnlUeXBlKTogRGF0YUZpbmRlclxuICAgIHtcblxuICAgICAgICBsZXQgZmluZGVyTWF0Y2g6IFR5cGU8RGF0YUZpbmRlcj47XG4gICAgICAgIHRoaXMuZmluZGVyc0J5VHlwZS5mb3JFYWNoKCh2OiBUeXBlPERhdGFGaW5kZXI+LCBrOiBEYXRhRmluZGVyKSA9PlxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoay5hY2NlcHRzKGZvclByb3ZpZGVyLCBmb3JUeXBlKSkge1xuICAgICAgICAgICAgICAgIGZpbmRlck1hdGNoID0gdjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGlzUHJlc2VudChmaW5kZXJNYXRjaCkpIHtcbiAgICAgICAgICAgIGxldCBjb3B5ID0gbmV3IGZpbmRlck1hdGNoKCk7XG4gICAgICAgICAgICBjb3B5LmZvckRhdGEoZm9yUHJvdmlkZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgbmV3IGZpbmRlclxuICAgICAqXG4gICAgICovXG4gICAgcmVnaXN0ZXI8VD4ocHJvdG90eXBlOiBEYXRhRmluZGVyLCB0eXBlOiBUeXBlPERhdGFGaW5kZXI+KTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5maW5kZXJzQnlUeXBlLnNldChwcm90b3R5cGUsIHR5cGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdEZpbmRlcnMoKVxuICAgIHtcbiAgICAgICAgLy8gY3JlYXRlIGEgcHJvdG90eXBlIGZvciBlYWNoXG4gICAgICAgIHRoaXMuZmluZGVyc0J5VHlwZS5zZXQobmV3IEZ1bGxUZXh0QXJyYXlEYXRhRmluZGVyKCksIEZ1bGxUZXh0QXJyYXlEYXRhRmluZGVyKTtcbiAgICAgICAgdGhpcy5maW5kZXJzQnlUeXBlLnNldChuZXcgT3V0bGluZUZ1bGxUZXh0QXJyYXlEYXRhRmluZGVyKCksXG4gICAgICAgICAgICBPdXRsaW5lRnVsbFRleHRBcnJheURhdGFGaW5kZXIpO1xuXG4gICAgfVxufVxuXG4vKipcbiAqIFdlIGhhdmUgZGlmZmVyZW50IG9wdGlvbnMgaG93IHRvIHF1ZXJ5IGRhdGEuIEZ1bGxUZXh0IHVzZXMgYSBzdHJpbmcgd2hlcmUgcHJlZGljYXRlIGlzXG4gKiB1c2luZyBrZXk6dmFsdWUgcGFpciB0byBidWlsdCBhIHF1ZXJ5XG4gKi9cbmV4cG9ydCBlbnVtIFF1ZXJ5VHlwZVxue1xuICAgIEZ1bGxUZXh0LFxuICAgIEZ1bGxUZXh0T3V0bGluZSxcbiAgICBQcmVkaWNhdGUsXG4gICAgRnVsbFRleHRBbmRQcmVkaWNhdGVcbn1cblxuXG4vKipcbiAqIFRoaXMgY2xhc3MgcHJvdmlkZXMgbWF0Y2hpbmcgY2FwYWJpbGl0eSBmb3IgZ2l2ZW4gRGF0YVByb3ZpZGVyLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRGF0YUZpbmRlclxue1xuXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIExvb2t1cCBrZXkgdG8gYXBwbHkgd2hlbiBydW5uaW5nIG1hdGNoLiBJZGVhbGx5IHlvdXIgRFMgc2hvdWxkIGJlIGFibGUgdG8gc2V0IGxvb2t1cEtleVxuICAgICAqIGVpdGhlciBnbG9iYWxseSBmb3IgZ2l2ZW4gZGF0YVByb3ZpZGVyIG9yIGxvY2FsbHkgZXZlcnkgdGltZSB5b3UgcnVuIHNlYXJjaC4gVGhpcyBpcyBpblxuICAgICAqIGNhc2UgeW91IGhhdmUgbWFueSBjaG9vc2VycyBmb3IgdGhlIHNhbWUgdHlwZSBhbmQgeW91IHdhbnQgdGhlbSB0byBoYXZlIGRpZmZlcmVudCBsb29rdXBcbiAgICAgKiBrZXkuXG4gICAgICpcbiAgICAgKlxuICAgICAqXG4gICAgICovXG4gICAgYWJzdHJhY3Qgc2V0IGxvb2t1cEtleShrZXk6IHN0cmluZyk7XG5cbiAgICAvKipcbiAgICAgKiBJbiBvcmRlciB0byBmaW5kIGNvbmNyZXRlIERhdGFGaW5kZXIgd2UgbmVlZCB0byBrbm93IHRoZSB0YXJnZXQgdHlwZSBhbmQgdGhlIHF1ZXJ5IHR5cGVcbiAgICAgKlxuICAgICAqL1xuICAgIGFjY2VwdHMoZm9yRGF0YTogRGF0YVByb3ZpZGVyPGFueT4sIGZvclR5cGU6IFF1ZXJ5VHlwZSk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIFNldHMgYSBEYXRhUHJvdmlkZXIgZm9yIERhdGFGaW5kZXJcbiAgICAgKlxuICAgICAqL1xuICAgIGFic3RyYWN0IGZvckRhdGEocHJvdmlkZXI6IERhdGFQcm92aWRlcjxhbnk+KTogRGF0YUZpbmRlcjtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogTWF0Y2hpbmcgbWV0aG9kcyB3aGljaCBhcmUgZWl0aGVyIGFzeW5jIG9yIHN5bmNcbiAgICAgKlxuICAgICAqL1xuICAgIGFic3RyYWN0IGluc3RhbnRNYXRjaDxUPihxdWVyeTogYW55LCBtYXg6IG51bWJlcik6IFRbXTtcblxuICAgIGFic3RyYWN0IGluc3RhbnRNYXRjaFdpdGhTZWxlY3Rpb25zPFQ+KHNlbGVjdGlvbnNGb3JNYXRjaDogYW55W10sIHF1ZXJ5OiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiBudW1iZXIpOiBUW107XG5cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogUXVlcnkgY2FuIGJlIGEgc2ltcGxlIHN0cmluZyBsaXRlcmFsIG9yIGEgbWFwIGhhdmluZyBkaWZmZXJlbnQga2V5IHZhbHVlIHBhaXIgYXMgYVxuICAgICAqIGZpbHRlclxuICAgICAqXG4gICAgICovXG4gICAgbWF0Y2g8VD4ocXVlcnk6IGFueSwgbWF4OiBudW1iZXIgPSAtMSk6IE9ic2VydmFibGU8VFtdPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTtcbiAgICB9XG5cbiAgICBtYXRjaFdpdGhTZWxlY3Rpb25zPFQ+KHNlbGVjdGlvbnM6IGFueVtdLCBxdWVyeTogYW55LCBtYXg6IG51bWJlcik6IE9ic2VydmFibGU8VFtdPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBTaW1wbGUgRnVsbFRleHQgaW1wbGVtZW50YXRpb24gYmFzZWQgb24gaW5maXggc3RyaW5nIG1hdGNoaW5nIHdoaWNoIHdvcmtzIG9uIHRvcCBvZlxuICogQXJyYXlEYXRhUHJvdmlkZXIuXG4gKlxuICovXG5leHBvcnQgY2xhc3MgRnVsbFRleHRBcnJheURhdGFGaW5kZXIgZXh0ZW5kcyBEYXRhRmluZGVyXG57XG4gICAgLyoqXG4gICAgICogIElmIGxpc3QgdmFsdWUgaXMgb2JqZWN0IHNldCBrZXlQYXRoIHRvIGdldCB0aGUgb2JqZWN0IHZhbHVlXG4gICAgICovXG4gICAgX2tleVBhdGg6IEZpZWxkUGF0aDtcblxuICAgIC8qKlxuICAgICAqIEN1cnJlbnQgRGF0YVByb3ZpZGVyIHVzZWQgdG8gYWNjZXNzIGRhdGFcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Byb3ZpZGVyOiBEYXRhUHJvdmlkZXI8YW55PjtcblxuICAgIHNldCBsb29rdXBLZXkoa2V5OiBzdHJpbmcpXG4gICAge1xuICAgICAgICB0aGlzLl9rZXlQYXRoID0gaXNQcmVzZW50KGtleSkgPyBuZXcgRmllbGRQYXRoKGtleSkgOiBudWxsO1xuICAgIH1cblxuICAgIGFjY2VwdHMoZm9yRGF0YTogRGF0YVByb3ZpZGVyPGFueT4sIGZvclR5cGU6IFF1ZXJ5VHlwZSk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiBmb3JEYXRhIGluc3RhbmNlb2YgQXJyYXlEYXRhUHJvdmlkZXIgJiYgZm9yVHlwZSA9PT0gUXVlcnlUeXBlLkZ1bGxUZXh0O1xuICAgIH1cblxuICAgIGZvckRhdGEocHJvdmlkZXI6IERhdGFQcm92aWRlcjxhbnk+KTogRnVsbFRleHRBcnJheURhdGFGaW5kZXJcbiAgICB7XG4gICAgICAgIHRoaXMuX3Byb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGluc3RhbnRNYXRjaDxUPihxdWVyeTogYW55LCBtYXg6IG51bWJlcik6IFRbXVxuICAgIHtcbiAgICAgICAgYXNzZXJ0KGlzUHJlc2VudCh0aGlzLl9wcm92aWRlciksICdNaXNzaW5nIERhdGFQcm92aWRlcicpO1xuXG4gICAgICAgIGxldCBsaXN0ID0gdGhpcy5fcHJvdmlkZXIuZGF0YUZvclBhcmFtcyhuZXcgTWFwKCkuc2V0KCdsaW1pdCcsIG1heCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW50TWF0Y2hXaXRoU2VsZWN0aW9uczxUPihsaXN0LCBxdWVyeSwgbWF4KTtcbiAgICB9XG5cbiAgICBpbnN0YW50TWF0Y2hXaXRoU2VsZWN0aW9uczxUPihzZWxlY3Rpb25zRm9yTWF0Y2g6IGFueVtdLCBxdWVyeTogc3RyaW5nLCBtYXg6IG51bWJlcik6IEFycmF5PFQ+XG4gICAge1xuICAgICAgICBhc3NlcnQoaXNQcmVzZW50KHRoaXMuX3Byb3ZpZGVyKSwgJ01pc3NpbmcgRGF0YVByb3ZpZGVyJyk7XG5cbiAgICAgICAgaWYgKGlzQmxhbmsocXVlcnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uc0Zvck1hdGNoO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZXN1bHQ6IGFueVtdID0gW107XG4gICAgICAgIGxldCB0b0xvd2VyUGF0dGVybiA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb25zRm9yTWF0Y2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gc2VsZWN0aW9uc0Zvck1hdGNoW2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMubWF0Y2hlcyhpdGVtLCB0b0xvd2VyUGF0dGVybikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA+PSBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBXYXJuaW5nOiBJZiB5b3UgZG9udCBzdXBwbHkgc2VhcmNoIEtleSBhbmQgeW91IHdhbnQgZnVsbHRleHQgc2VhcmNoIGFuZCB5b3UgdXNlIHRoaXNcbiAgICAgKiBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGJlIGF3YXJlIHRoYXQgaXQgY2FuICBwZXJmb3JtIHBvb3JseSBhcyBpdCBpcyBuYWl2ZSBpbXBsZW1lbnRhaW9uXG4gICAgICogdGhhdCBkb2VzIG5vdCBkbyBkZWVwIGNvbXBhcmUuXG4gICAgICpcbiAgICAgKi9cbiAgICBtYXRjaGVzPFQ+KGl0ZW06IGFueSwgcGF0dGVybjogc3RyaW5nKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgbGV0IHZhbCA9IChpc1ByZXNlbnQodGhpcy5fa2V5UGF0aCkpID8gdGhpcy5fa2V5UGF0aC5nZXRGaWVsZFZhbHVlKGl0ZW0pIDogaXRlbTtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24odmFsKSkge1xuICAgICAgICAgICAgdmFsID0gdmFsLmNhbGwoaXRlbSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNKc09iamVjdChpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzT2JqZWN0VmFsdWUoaXRlbSwgcGF0dGVybik7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpc0JsYW5rKHBhdHRlcm4pIHx8XG4gICAgICAgICAgICAgICAgaXNQcmVzZW50KHZhbCkgJiYgdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHBhdHRlcm4pID4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIG1hdGNoPFQ+KHF1ZXJ5OiBhbnksIG1heDogbnVtYmVyKTogT2JzZXJ2YWJsZTxUW10+XG4gICAge1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKHRoaXMuaW5zdGFudE1hdGNoKHF1ZXJ5LCBtYXgpKTtcbiAgICB9XG5cbiAgICBtYXRjaFdpdGhTZWxlY3Rpb25zPFQ+KHNlbGVjdGlvbnM6IGFueVtdLCBxdWVyeTogYW55LCBtYXg6IG51bWJlcik6IE9ic2VydmFibGU8VFtdPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGVPZih0aGlzLmluc3RhbnRNYXRjaFdpdGhTZWxlY3Rpb25zKHNlbGVjdGlvbnMsIHF1ZXJ5LCBtYXgpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFzT2JqZWN0VmFsdWUob2JqOiBhbnksIHBhdHRlcm46IHN0cmluZyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBvYmplY3RWYWx1ZXMob2JqKTtcbiAgICAgICAgbGV0IHBhcmVudE9iaiA9IG9iamVjdFRvTmFtZShvYmopO1xuICAgICAgICBsZXQgbGVuZ3RoMiA9IHZhbHVlcy5maWx0ZXIoKHZhbHVlOiBhbnkpID0+XG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChpc0JsYW5rKHZhbHVlKSB8fCBpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNKc09iamVjdCh2YWx1ZSkgJiYgIWlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHBhdHRlcm4pICE9PSAtMTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0pzT2JqZWN0KHZhbHVlKSAmJiBvYmplY3RUb05hbWUodmFsdWUpICE9PSBwYXJlbnRPYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYXNPYmplY3RWYWx1ZSh2YWx1ZSwgcGF0dGVybik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkubGVuZ3RoO1xuICAgICAgICByZXR1cm4gbGVuZ3RoMiA+IDA7XG4gICAgfVxufVxuXG5cbi8qKlxuICogRXh0ZW5kcyBiYXNpYyBJbmZpeCBpbXBsZW1lbnRhdGlvbiB0byB3b3JrIG9uIHRvcCBvZiBPdXRsaW5lTm9kZXMuIEl0IGZpcnN0IGNoZWNrcyBhbGwgdGhlXG4gKiBjaGlsZHJlbiBvbiBsb3dlc3QgbGV2ZWwgYW5kIG1vdmluZyB1cCB0byB0aGUgcm9vdCBhbmQgbWFya2luZyBub2RlcyB0aGF0IGNhbiBiZSByZW1vdmVkLlxuICpcbiAqICBGb3Igc2ltcGxlIGRhdGEgc3RydWN0dXJlIHdoaWNoIG9wZXJhdGVzIG9uIGxvY2FsIGFycmF5IHRoaXMgc2hvdWxkIGJlIGdvb2QgZW5vdWdoIHdlIHRoaXNcbiAqICBjYW4gbmV2ZXIgbWF0Y2ggd2l0aCByZWFsIERCIGZ1bGwgdGV4dCBzZWFyY2guXG4gKlxuICovXG5leHBvcnQgY2xhc3MgT3V0bGluZUZ1bGxUZXh0QXJyYXlEYXRhRmluZGVyIGV4dGVuZHMgRnVsbFRleHRBcnJheURhdGFGaW5kZXJcbntcblxuICAgIGFjY2VwdHMoZm9yRGF0YTogRGF0YVByb3ZpZGVyPGFueT4sIGZvclR5cGU6IFF1ZXJ5VHlwZSk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiBmb3JEYXRhIGluc3RhbmNlb2YgQXJyYXlEYXRhUHJvdmlkZXIgJiYgZm9yVHlwZSA9PT0gUXVlcnlUeXBlLkZ1bGxUZXh0T3V0bGluZTtcbiAgICB9XG5cblxuICAgIGluc3RhbnRNYXRjaFdpdGhTZWxlY3Rpb25zPFQ+KHNlbGVjdGlvbnNGb3JNYXRjaDogYW55W10sIHF1ZXJ5OiBzdHJpbmcsIG1heDogbnVtYmVyKTogQXJyYXk8VD5cbiAgICB7XG4gICAgICAgIGFzc2VydChpc1ByZXNlbnQodGhpcy5fcHJvdmlkZXIpLCAnTWlzc2luZyBEYXRhUHJvdmlkZXInKTtcblxuICAgICAgICBpZiAoaXNCbGFuayhxdWVyeSkpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25zRm9yTWF0Y2g7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRvTG93ZXJQYXR0ZXJuID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBsZXQgc291cmNlVG9TZWFyY2ggPSBzZWxlY3Rpb25zRm9yTWF0Y2guc2xpY2UoKTtcbiAgICAgICAgdGhpcy5yb2xsdXAoc291cmNlVG9TZWFyY2gsIHRvTG93ZXJQYXR0ZXJuKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hha2Uoc291cmNlVG9TZWFyY2gpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBHb2luZyB0aHJ1IHRoZSB0cmVlIGZyb20gYm90dG9tIHVwIGFuZCBtYXJrIGFsbCB0aGF0IG1hdGNoZXMgcXVlcnlcbiAgICAgKlxuICAgICAqL1xuICAgIHJvbGx1cChub2RlczogT3V0bGluZU5vZGVbXSwgcXVlcnk6IHN0cmluZyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIG5vZGVzLmZvckVhY2goKGl0ZW06IE91dGxpbmVOb2RlKSA9PlxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBzdGFydCBmcm9tIGJvdHRvbSB1cCBhbmQgY2FwdHVyZSBob3cgbWFueSBvY2N1cnJlbmNlcyBpcyBmb3VuZCBmb3IgZnV0dXJlIHVzZVxuICAgICAgICAgICAgbGV0IGhhc0NoaWxkcmVuTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoaXRlbS5jaGlsZHJlbikgJiYgaXRlbS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaGFzQ2hpbGRyZW5NYXRjaCA9IHRoaXMucm9sbHVwKGl0ZW0uY2hpbGRyZW4sIHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0udmlzaWJsZSA9IGhhc0NoaWxkcmVuTWF0Y2ggfHwgdGhpcy5tYXRjaGVzKGl0ZW0sIHF1ZXJ5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5vZGVzLnNvbWUoKGl0ZW06IE91dGxpbmVOb2RlKSA9PiBpdGVtLnZpc2libGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbHRlciBvdXQgYWxsIHRoZSBub2RlcyB0aGF0IGFyZSBtYXJrZWQgYXMgdmlzaWJsZSA9IGZhbHNlIGFuZCBtYWtlIHN1cmUgYW5kXG4gICAgICogZG9uJ3QgbW9kaWZ5IG9yaWdpbmFsIGxpc3RcbiAgICAgKlxuICAgICAqL1xuICAgIHNoYWtlKG5vZGVzOiBPdXRsaW5lTm9kZVtdKTogYW55W11cbiAgICB7XG4gICAgICAgIHJldHVybiBub2Rlc1xuICAgICAgICAgICAgLmZpbHRlcihub2RlID0+IG5vZGUudmlzaWJsZSlcbiAgICAgICAgICAgIC5tYXAobm9kZSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLm5vZGUsXG4gICAgICAgICAgICAgICAgaXNFeHBhbmRlZDogbm9kZS52aXNpYmxlLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBub2RlLmNoaWxkcmVuICYmIHRoaXMuc2hha2Uobm9kZS5jaGlsZHJlbilcbiAgICAgICAgICAgIH0pKTtcbiAgICB9XG5cbn1cblxuXG4iXX0=