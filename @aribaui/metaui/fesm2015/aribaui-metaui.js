import { assert, crc32, hashCode, isArray, isBlank, isPresent, print, shiftLeft, StringJoiner, unimplemented, BooleanWrapper, evalExpressionWithCntx, FieldPath, isBoolean, isFunction, isNumber, isString, className, Extensible, isStringMap, ListWrapper, MapWrapper, objectToName, equals, isEntity, isValue, shiftRight, StringWrapper, AppConfig, decamelize, Environment, RoutingService, warn, nonPrivatePrefix, AribaCoreModule } from '@aribaui/core';
import { Dictionary, util } from 'typescript-collections';
import { ComponentRegistry, BaseFormComponent, DomUtilsService, IncludeComponentDirective, FormRowComponent, BaseComponent, SectionComponent, AribaComponentsModule } from '@aribaui/components';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, Inject, Input, Optional, Output, SkipSelf, NgModule, Injectable, ChangeDetectorRef, ComponentFactoryResolver, Directive, ViewContainerRef, Host, ViewChild, ViewChildren, APP_INITIALIZER, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Represents a set of matching rules resulting from looking up a set of key/values
 *  against the Meta rule base.
 *
 * Instances of the Match superclass are simply immutable snapshots of previous matches
 * (used as keys in Match -> Properties lookup caches).
 * The more meaty class is its static inner subclass, Match.MatchResult.
 */
class Match {
    /**
     * @param {?} _matches
     * @param {?} _keysMatchedMask
     * @param {?=} _matchPathCRC
     */
    constructor(_matches, _keysMatchedMask, _matchPathCRC = 0) {
        this._matches = _matches;
        this._keysMatchedMask = _keysMatchedMask;
        this._matchPathCRC = _matchPathCRC;
    }
    /**
     * @param {?} intArr
     * @param {?} val
     * @return {?}
     */
    static addInt(intArr, val) {
        if (isBlank(intArr)) {
            let /** @type {?} */ r = new Array(4);
            r[0] = 1;
            r[1] = val;
            return r;
        }
        let /** @type {?} */ newPos = intArr[0];
        if (intArr[newPos++] === val) {
            return intArr;
        } // already here...
        if (newPos >= intArr.length) {
            let /** @type {?} */ a = new Array(newPos * 2);
            a = intArr.slice(0, newPos);
            intArr = a;
        }
        intArr[newPos] = val;
        intArr[0] = newPos;
        return intArr;
    }
    /**
     * @param {?} rules
     * @param {?} arr
     * @param {?} usesMask
     * @return {?}
     */
    static filterMustUse(rules, arr, usesMask) {
        if (isBlank(arr)) {
            return null;
        }
        let /** @type {?} */ result;
        let /** @type {?} */ count = arr[0];
        for (let /** @type {?} */ i = 0; i < count; i++) {
            let /** @type {?} */ r = arr[i + 1];
            let /** @type {?} */ rule = rules[r];
            if ((rule.keyMatchesMask & usesMask) !== 0) {
                result = Match.addInt(result, r);
            }
        }
        return result;
    }
    /**
     * Intersects two rulevecs.  This is not a traditional intersection where only items in both
     * inputs are included in the result: we only intersect rules that match on common keys;
     * others are unioned.
     *
     * For instance, say we have the following inputs:
     *      a:  [matched on: class, layout]  (class=Foo, layout=Inspect)
     *          1) class=Foo layout=Inspect { ... }
     *          2) class=Foo operation=edit { ... }
     *          3) layout=Inspect operation=view { ... }
     *
     *      b:  [matched on: operation]  (operation=view)
     *          3) layout=Inspect operation=view { ... }
     *          4) operation=view type=String { ... }
     *          5) operation=view layout=Tabs { ... }
     *
     * The result should be: 1, 3, 4
     * I.e.: items that appear in both (#3 above) are included, as are items that appear in just
     * one,
     * *but don't match on the keys in the other* (#1 and #4 above).
     *
     * @param {?} allRules the full rule base
     * @param {?} a first vector of rule indexes
     * @param {?} b second vector of rule indexes
     * @param {?} aMask mask indicating the keys against which the first rule vectors items have
     *     already been matched
     * @param {?} bMask mask indicating the keys against which the second rule vectors items have
     *     already been matched
     * @return {?} rule vector for the matches
     */
    static intersect(allRules, a, b, aMask, bMask) {
        if (isBlank(a)) {
            return b;
        }
        let /** @type {?} */ result;
        let /** @type {?} */ iA = 1, /** @type {?} */ sizeA = isPresent(a[0]) ? a[0] : 0, /** @type {?} */ iB = 1, /** @type {?} */ sizeB = isPresent(b[0]) ? b[0] : 0;
        Match._Debug_ElementProcessCount += sizeA + sizeB;
        while (iA <= sizeA || iB <= sizeB) {
            let /** @type {?} */ iAMask = (iA <= sizeA) ? allRules[a[iA]].keyIndexedMask : 0;
            let /** @type {?} */ iBMask = (iB <= sizeB) ? allRules[b[iB]].keyIndexedMask : 0;
            let /** @type {?} */ c = (iA > sizeA ? 1 : (iB > sizeB ? -1 : (a[iA] - b[iB])));
            if (c === 0) {
                result = Match.addInt(result, a[iA]);
                iA++;
                iB++;
            }
            else if (c < 0) {
                // If A not in B, but A doesn't filter on B's mask, then add it
                if ((iAMask & bMask) === 0) {
                    result = Match.addInt(result, a[iA]);
                }
                iA++;
            }
            else {
                if ((iBMask & aMask) === 0) {
                    result = Match.addInt(result, b[iB]);
                }
                iB++;
            }
        }
        return result;
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    static union(a, b) {
        if (isBlank(a)) {
            return b;
        }
        if (isBlank(b)) {
            return a;
        }
        let /** @type {?} */ sizeA = a[0], /** @type {?} */ sizeB = b[0];
        if (sizeA === 0) {
            return b;
        }
        if (sizeB === 0) {
            return a;
        }
        Match._Debug_ElementProcessCount += (sizeA + sizeB);
        let /** @type {?} */ result;
        let /** @type {?} */ iA = 1, /** @type {?} */ vA = a[1], /** @type {?} */ iB = 1, /** @type {?} */ vB = b[1];
        while (iA <= sizeA || iB <= sizeB) {
            let /** @type {?} */ c = vA - vB;
            result = Match.addInt(result, ((c <= 0) ? vA : vB));
            if (c <= 0) {
                iA++;
                vA = (iA <= sizeA) ? a[iA] : Number.MAX_VALUE;
            }
            if (c >= 0) {
                iB++;
                vB = (iB <= sizeB) ? b[iB] : Number.MAX_VALUE;
            }
        }
        return result;
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    static _arrayEq(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null || b === null) {
            return false;
        }
        let /** @type {?} */ count = a[0];
        if (count !== b[0]) {
            return false;
        }
        for (let /** @type {?} */ i = 1; i <= count; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Filter a partially matched set of rules down to the actual matches.
     * The input set of rules, matchesArr, is based on a *partial* match, and so includes rules
     * that were touched by some of the queried keys, but that may also require *additional* keys
     * that we have not matched on -- these must now be removed. Also, when 'partial indexing',
     * rules are indexed on a subset of their keys, so matchesArr will contain rules that need to
     * be evaluated against those MatchValues upon which they were not indexed (and therefore not
     * intersected / filtered on in the lookup process).
     * @param {?} allRules
     * @param {?} maxRule
     * @param {?} matchesArr
     * @param {?} queriedMask
     * @param {?} matchArray
     * @return {?}
     */
    filter(allRules, maxRule, matchesArr, queriedMask, matchArray) {
        if (isBlank(matchesArr)) {
            return null;
        }
        // print('\n## Filtering matching: ' + matchesArr[0] + ', Queried Mask: ' + queriedMask);
        //
        // for (let i = 1; i <= matchesArr[0]; i++) {
        //     print('## ' + matchesArr[i] + '): ' + allRules[matchesArr[i]].toString());
        // }
        let /** @type {?} */ result;
        let /** @type {?} */ count = matchesArr[0];
        for (let /** @type {?} */ i = 0; i < count; i++) {
            let /** @type {?} */ r = matchesArr[i + 1];
            if (r >= maxRule) {
                continue;
            }
            let /** @type {?} */ rule = allRules[r];
            if (rule.disabled() || (rule.keyAntiMask & queriedMask) !== 0) {
                continue;
            }
            // Must have matched on (activate) all match keys for this rule, *and*
            // if have any non-indexed rules, need to check match on those
            if (((rule.keyMatchesMask & ~queriedMask) === 0) &&
                ((rule.keyMatchesMask === rule.keyIndexedMask)
                    ||
                        (isPresent(matchArray) && rule.matches(matchArray)))) {
                if (Meta._DebugDoubleCheckMatches && !(matchArray != null && rule.matches(matchArray))) {
                    assert(false, 'Inconsistent (negative) match on rule: ' + rule);
                }
                result = Match.addInt(result, r);
            }
            else if (Meta._DebugDoubleCheckMatches && (matchArray != null && rule.matches(matchArray))) ;
        }
        // if (isPresent(result) && result.length > 0) {
        //     print('\n\n\n #### Filtering RESULT: ' + result[0]);
        //
        //     for (let i = 1; i <= result[0]; i++) {
        //         print('## ' + result[i] + '): ' + allRules[result[i]].toString());
        //     }
        // }
        return result;
    }
    /**
     * @return {?}
     */
    hashCode() {
        let /** @type {?} */ ret = this._keysMatchedMask * 31 + this._matchPathCRC;
        if (isPresent(this._matches)) {
            for (let /** @type {?} */ i = 0, /** @type {?} */ c = this._matches[0]; i < c; i++) {
                ret = crc32(ret, this._matches[i + 1]);
            }
        }
        return ret;
    }
    /**
     * @return {?}
     */
    get keysMatchedMask() {
        return this._keysMatchedMask;
    }
    /**
     * @param {?} o
     * @return {?}
     */
    equalsTo(o) {
        return ((o instanceof Match) && this._keysMatchedMask === o._keysMatchedMask) &&
            this._matchPathCRC === o._matchPathCRC &&
            Match._arrayEq(this._matches, o._matches);
    }
    /**
     * @return {?}
     */
    toString() {
        let /** @type {?} */ buf = new StringJoiner([]);
        buf.add('_matches');
        buf.add((isPresent(this._matches) ? this._matches.length : 0) + '');
        buf.add('_keysMatchedMask');
        buf.add(this._keysMatchedMask + '');
        buf.add('_keysMatchedMask');
        buf.add(this._matchPathCRC + '');
        buf.add('hashcode');
        buf.add(this.hashCode() + '');
        return buf.toString();
    }
}
Match.EmptyMatchArray = [];
Match._Debug_ElementProcessCount = 0;
/**
 *  An Match which includes a UnionMatchResult part (which is used by Context to
 * represent the set of overridden key/values up the stack)
 */
class MatchWithUnion extends Match {
    /**
     * @param {?} _matches
     * @param {?} _keysMatchedMask
     * @param {?=} _matchPathCRC
     * @param {?=} _overUnionMatch
     */
    constructor(_matches, _keysMatchedMask, _matchPathCRC = 0, _overUnionMatch) {
        super(_matches, _keysMatchedMask, _matchPathCRC);
        this._matches = _matches;
        this._keysMatchedMask = _keysMatchedMask;
        this._matchPathCRC = _matchPathCRC;
        this._overUnionMatch = _overUnionMatch;
    }
    /**
     * @param {?} o
     * @return {?}
     */
    equalsTo(o) {
        return super.equalsTo(o) && ((this._overUnionMatch === o._overUnionMatch) ||
            ((isPresent(this._overUnionMatch)) && isPresent(o._overUnionMatch) && this._overUnionMatch.equalsTo(o._overUnionMatch)));
    }
}
/**
 *  MatchResult represents the result of computing the set of matching rules
 *  based on the key/value on this instance, and the other key/value pairs
 * on its predecessor chain.  I.e. to find the matching rules for the context keys
 * {operation=edit; layout=Inspect; class=Foo}, first a MatchResult is created for
 * 'operation=edit' and passed as the 'prev' to the creation of another for 'layout=Inspect',
 * and so on.  In this way the MatchResults form a *(sharable) partial-match tree.*
 *
 * The ability to result previous partial match 'paths' is an important optimization:
 * the primary client of MatchResult (and of rule matching in general) is the Context, when each
 * assignment pushes a record on a stack that (roughly) extends the Match from the previous
 * assignment.  By caching MatchResult instances on the _Assignment records, matching is limited
 *  to the *incremental* matching on just the new assignment, not a full match on all keys in the
 *  context.
 *
 * Further, a MatchResult caches the *property map* resulting from the application of the rules
 *  that it matches.  By caching MatchResult objects (and caching the map from
 *  Rule vector (AKA Match) -> MatchResult -> PropertyMap), redudant rule application (and creation
 * of additional property maps) is avoided.
 */
class MatchResult extends MatchWithUnion {
    /**
     * @param {?} _meta
     * @param {?} _keyData
     * @param {?} _value
     * @param {?} _prevMatch
     */
    constructor(_meta, _keyData, _value, _prevMatch) {
        super(null, null, 0, (_prevMatch != null) ? _prevMatch._overUnionMatch : null);
        this._meta = _meta;
        this._keyData = _keyData;
        this._value = _value;
        this._prevMatch = _prevMatch;
        this._metaGeneration = 0;
        this._initMatch();
    }
    /**
     * @param {?} over
     * @return {?}
     */
    setOverridesMatch(over) {
        this._overUnionMatch = over;
    }
    /**
     * @return {?}
     */
    matches() {
        this._invalidateIfStale();
        if (isBlank(this._matches)) {
            this._initMatch();
        }
        return this._matches;
    }
    /**
     * @return {?}
     */
    filterResult() {
        return this.filter(this._meta._rules, this._meta._ruleCount, this.matches(), this._keysMatchedMask, null);
    }
    /**
     * Fill in matchArray with MatchValues to use in Selector matching
     * @param {?} matchArray
     * @return {?}
     */
    initMatchValues(matchArray) {
        if (isPresent(this._prevMatch)) {
            this._prevMatch.initMatchValues(matchArray);
        }
        if (isPresent(this._overUnionMatch)) {
            this._overUnionMatch.initMatchValues(matchArray);
        }
        this._meta.matchArrayAssign(matchArray, this._keyData, this._keyData.matchValue(this._value));
    }
    /**
     * @return {?}
     */
    filteredMatches() {
        // shouldn't this be cached?!?
        let /** @type {?} */ matches = this.matches();
        let /** @type {?} */ keysMatchedMask = this._keysMatchedMask | (isPresent(this._overUnionMatch) ? this._overUnionMatch._keysMatchedMask : 0);
        let /** @type {?} */ overrideMatches;
        if (isPresent(this._overUnionMatch) && isPresent((overrideMatches = this._overUnionMatch.matches()))) {
            if (isBlank(matches)) {
                matches = overrideMatches;
            }
            else {
                matches = Match.intersect(this._meta._rules, matches, overrideMatches, this._keysMatchedMask, this._overUnionMatch._keysMatchedMask);
            }
        }
        let /** @type {?} */ matchArray;
        if (Meta._UsePartialIndexing) {
            matchArray = this._meta.newMatchArray();
            this.initMatchValues(matchArray);
        }
        return this.filter(this._meta._rules, this._meta._ruleCount, matches, keysMatchedMask, matchArray);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    valueForKey(key) {
        return (this._keyData._key === key) ? this._value :
            (isPresent(this._prevMatch) ? this._prevMatch.valueForKey(key) : null);
    }
    /**
     * @return {?}
     */
    immutableCopy() {
        this._invalidateIfStale();
        return new MatchWithUnion(this.matches(), this._keysMatchedMask, this._matchPathCRC, this._overUnionMatch);
    }
    /**
     * @return {?}
     */
    _invalidateIfStale() {
        if (this._metaGeneration < this._meta.ruleSetGeneration) {
            this._initMatch();
        }
    }
    /**
     * @param {?} a
     * @param {?} b
     * @param {?} aMask
     * @param {?} bMask
     * @return {?}
     */
    join(a, b, aMask, bMask) {
        return Match.intersect(this._meta._rules, a, b, aMask, bMask);
    }
    /**
     * @return {?}
     */
    _initMatch() {
        let /** @type {?} */ keyMask = shiftLeft(1, this._keyData._id);
        // get vec for this key/value -- if value is list, compute the union
        let /** @type {?} */ newArr;
        if (isArray(this._value)) {
            for (let /** @type {?} */ v of this._value) {
                let /** @type {?} */ a = this._keyData.lookup(this._meta, v);
                newArr = Match.union(a, newArr);
            }
        }
        else {
            newArr = this._keyData.lookup(this._meta, this._value);
        }
        let /** @type {?} */ prevMatches = (isBlank(this._prevMatch)) ? null : this._prevMatch.matches();
        this._keysMatchedMask = (isBlank(this._prevMatch)) ? keyMask : (keyMask | this._prevMatch._keysMatchedMask);
        if (isBlank(prevMatches)) {
            this._matches = newArr;
            // Todo: not clear why this is needed, but without it we end up failing to filter
            // certain matches that should be filtered (resulting in bad matches)
            if (!Meta._UsePartialIndexing) {
                this._keysMatchedMask = keyMask;
            }
        }
        else {
            if (isBlank(newArr)) {
                newArr = Match.EmptyMatchArray;
            }
            // Join
            this._matches = this.join(newArr, prevMatches, keyMask, this._prevMatch._keysMatchedMask);
        }
        // compute path CRC
        this._matchPathCRC = -1;
        for (let /** @type {?} */ mr = this; mr != null; mr = mr._prevMatch) {
            this._matchPathCRC = crc32(this._matchPathCRC, mr._keyData._key.length);
            if (isPresent(mr._value)) {
                let /** @type {?} */ value = isArray(mr._value) ? mr._value.join(',') : mr._value;
                this._matchPathCRC = crc32(this._matchPathCRC, hashCode(value));
            }
        }
        if (this._matchPathCRC === 0) {
            this._matchPathCRC = 1;
        }
        this._metaGeneration = this._meta.ruleSetGeneration;
        this._properties = null;
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    _logMatchDiff(a, b) {
        let /** @type {?} */ iA = 1, /** @type {?} */ sizeA = a[0], /** @type {?} */ iB = 1, /** @type {?} */ sizeB = b[0];
        while (iA <= sizeA || iB <= sizeB) {
            let /** @type {?} */ c = (iA > sizeA ? 1 : (iB > sizeB ? -1 : (a[iA] - b[iB])));
            if (c === 0) {
                iA++;
                iB++;
            }
            else if (c < 0) {
                // If A not in B, but A doesn't filter on B's mask, then add it
                print('  -- Only in A: ' + this._meta._rules[a[iA]]);
                iA++;
            }
            else {
                print('  -- Only in B: ' + this._meta._rules[b[iB]]);
                iB++;
            }
        }
    }
    /**
     * @return {?}
     */
    properties() {
        this._invalidateIfStale();
        if (isBlank(this._properties)) {
            this._properties = this._meta.propertiesForMatch(this);
        }
        return this._properties;
    }
    /**
     * @return {?}
     */
    debugString() {
        let /** @type {?} */ sj = new StringJoiner(['Match Result path: \n']);
        this._appendPrevPath(sj);
        if (isPresent(this._overUnionMatch)) {
            sj.add('\nOverrides path: ');
            this._overUnionMatch._appendPrevPath(sj);
        }
        return sj.toString();
    }
    /**
     * @param {?} buf
     * @return {?}
     */
    _appendPrevPath(buf) {
        if (isPresent(this._prevMatch)) {
            this._prevMatch._appendPrevPath(buf);
            buf.add(' -> ');
        }
        buf.add(this._keyData._key);
        buf.add('=');
        buf.add(this._value);
    }
    /**
     * @param {?} values
     * @param {?} meta
     * @return {?}
     */
    _checkMatch(values, meta) {
        let /** @type {?} */ arr = this.filterResult();
        if (isBlank(arr)) {
            return;
        }
        // first entry is count
        let /** @type {?} */ count = arr[0];
        for (let /** @type {?} */ i = 0; i < count; i++) {
            let /** @type {?} */ r = this._meta._rules[arr[i + 1]];
            r._checkRule(values, meta);
        }
    }
    /**
     * @param {?} o
     * @return {?}
     */
    equalsTo(o) {
        return (o instanceof MatchResult) && super.equalsTo(o) && (o._metaGeneration === this._metaGeneration) &&
            o._properties.size === this._properties.size;
    }
}
class UnionMatchResult extends MatchResult {
    /**
     * @param {?} meta
     * @param {?} keyData
     * @param {?} value
     * @param {?} prevMatch
     */
    constructor(meta, keyData, value, prevMatch) {
        super(meta, keyData, value, prevMatch);
    }
    /**
     * @param {?} a
     * @param {?} b
     * @param {?} aMask
     * @param {?} bMask
     * @return {?}
     */
    join(a, b, aMask, bMask) {
        return Match.union(a, b);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * A map that masks on top of an (immutable) parent map
 * @template K, V
 */
class NestedMap {
    /**
     * @param {?} _parent
     * @param {?=} _map
     */
    constructor(_parent, _map) {
        this._parent = _parent;
        this._map = _map;
        this._overrideCount = 0;
        this._size = 0;
        if (isBlank(_map)) {
            this._map = new Map();
        }
    }
    /**
     * @param {?} iteratorResult
     * @return {?}
     */
    static toMapEntry(iteratorResult) {
        let /** @type {?} */ value = iteratorResult.value;
        if (isPresent(value) && NestedMap.isMapEntry(value)) {
            return value;
        }
        let /** @type {?} */ entry = {
            key: (isPresent(iteratorResult.value)) ? iteratorResult.value[0] : iteratorResult.value,
            value: (isPresent(iteratorResult.value)) ? iteratorResult.value[1] : iteratorResult.value,
            hasNext: !iteratorResult.done
        };
        return entry;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    static isMapEntry(value) {
        return isPresent(value) && isPresent(value.hasNext);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    static isNMNullMarker(value) {
        return isPresent(value) && value['nesnullmarker'];
    }
    /**
     * @return {?}
     */
    toMap() {
        return this._parent;
    }
    /**
     * @param {?} newParent
     * @return {?}
     */
    reparentedMap(newParent) {
        let /** @type {?} */ newMap = new NestedMap(newParent, this._map);
        newMap._overrideCount = this._overrideCount;
        return newMap;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    get(key) {
        let /** @type {?} */ val = this._map.has(key) ? this._map.get(key) : this._parent.get(key);
        return NestedMap.isNMNullMarker(val) ? null : val;
    }
    /**
     * @return {?}
     */
    keys() {
        return unimplemented();
    }
    /**
     * @return {?}
     */
    values() {
        return unimplemented();
    }
    /**
     * @return {?}
     */
    clear() {
        this._parent.clear();
        this._map.clear();
    }
    /**
     * @param {?} key
     * @param {?=} value
     * @return {?}
     */
    set(key, value) {
        let /** @type {?} */ orig = this._map.get(key);
        if ((NestedMap.isNMNullMarker(orig) || isBlank(orig)) && this._parent.has(key)) {
            this._overrideCount += (NestedMap.isNMNullMarker(orig) ? -1 : 1);
        }
        this._map.set(key, value);
        return this;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    delete(key) {
        let /** @type {?} */ returnVal = false;
        let /** @type {?} */ orig = null;
        if (this._map.has(key)) {
            orig = this._map.delete(key);
            returnVal = true;
            // print('Removing: ' , orig);
            if (this._parent.has(key)) {
                this._map.set(key, NestedMap._NullMarker);
                // _overrideCount--;
                this._overrideCount++;
            }
        }
        else if (this._parent.has(key)) {
            // we're "removing" a value we don't have (but that our parent does)
            // we need to store a null override
            orig = this._parent.get(key);
            // print('Removing: ' , orig);
            this._map.set(key, NestedMap._NullMarker);
            this._overrideCount += 2;
        }
        return returnVal;
    }
    /**
     * @param {?} callbackfn
     * @param {?=} thisArg
     * @return {?}
     */
    forEach(callbackfn, thisArg) {
        let /** @type {?} */ entries = this.entries();
        let /** @type {?} */ nextEntry;
        while ((nextEntry = NestedMap.toMapEntry(entries.next())) && nextEntry.hasNext) {
            callbackfn(nextEntry.value, nextEntry.key, this._parent);
        }
    }
    /**
     * @param {?} key
     * @return {?}
     */
    has(key) {
        return this._map.has(key) ? (!NestedMap.isNMNullMarker(this._map.get(key))) : this._parent.has(key);
    }
    /**
     * @return {?}
     */
    [Symbol.iterator]() {
        return new NestedEntryIterator(this);
    }
    /**
     * @return {?}
     */
    entries() {
        return new NestedEntryIterator(this);
    }
    /**
     * @return {?}
     */
    get size() {
        return this._parent.size + this._map.size - this._overrideCount;
    }
    /**
     * @return {?}
     */
    get map() {
        return this._map;
    }
    /**
     * @return {?}
     */
    get parent() {
        return this._parent;
    }
    /**
     * @return {?}
     */
    toString() {
        return 'NestedMap';
    }
}
NestedMap._NullMarker = { nesnullmarker: true };
/**
 * @template K, V
 */
class NestedEntryIterator {
    /**
     * @param {?} _nestedMap
     */
    constructor(_nestedMap) {
        this._nestedMap = _nestedMap;
        this._parentIterator = _nestedMap.parent.entries();
        this._nestedIterator = _nestedMap.map.entries();
        this.advanceToNext();
    }
    /**
     * @return {?}
     */
    next() {
        // assert(isPresent(this._nextEntry) , 'next() when no more elements"');
        this._currentEntry = this._nextEntry;
        this.advanceToNext();
        let /** @type {?} */ next = {
            value: this._currentEntry,
            done: !this._currentEntry.hasNext
        };
        return next;
    }
    /**
     * @return {?}
     */
    [Symbol.iterator]() {
        return this;
    }
    /**
     * @return {?}
     */
    advanceToNext() {
        this._fromNested = false;
        // Note: we need to skip nulls (masked values)
        while (!this._fromNested && (this._currentNestedEntry = NestedMap.toMapEntry(this._nestedIterator.next())) && this._currentNestedEntry.hasNext) {
            this._nextEntry = this._currentNestedEntry;
            if (!NestedMap.isNMNullMarker(this._nextEntry.value)) {
                this._fromNested = true;
            }
        }
        if (!this._fromNested) {
            while ((this._currentParentEntry = NestedMap.toMapEntry(this._parentIterator.next())) && this._currentParentEntry.hasNext) {
                this._nextEntry = this._currentParentEntry;
                if (!this._nestedMap.map.has(this._nextEntry.key)) {
                    return;
                }
            }
            this._nextEntry = this._currentParentEntry;
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @abstract
 */
class DynamicPropertyValue {
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        return unimplemented();
    }
    /**
     * @param {?} context
     * @return {?}
     */
    bind(context) {
        return unimplemented();
    }
}
/**
 * ;marker; interface for DynamicPropertyValues that depend only on their match context and
 * therefore can be computed and cached statically in the Context Activation tree
 */
class StaticallyResolvable extends DynamicPropertyValue {
}
class StaticDynamicWrapper extends StaticallyResolvable {
    /**
     * @param {?} _orig
     */
    constructor(_orig) {
        super();
        this._orig = _orig;
        this.propertyAwaking = true;
    }
    /**
     * @return {?}
     */
    getDynamicValue() {
        return this._orig;
    }
    /**
     * @param {?} map
     * @return {?}
     */
    awakeForPropertyMap(map) {
        // copy ourselves so there's a fresh copy for each context in which is appears
        let /** @type {?} */ origaw = (isPropertyMapAwaking(this._orig)) ? /** @type {?} */ ((/** @type {?} */ (this._orig)).awakeForPropertyMap(map)) : this._orig;
        return new StaticDynamicWrapper(origaw);
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        // we lazily static evaluate our value and cache the result
        if (isBlank(this._cached)) {
            this._cached = context.staticallyResolveValue(this._orig);
        }
        return this._cached;
    }
    /**
     * @return {?}
     */
    toString() {
        let /** @type {?} */ sj = new StringJoiner(['StaticDynamicWrapper']);
        sj.add('(');
        sj.add(((isPresent(this._cached)) ? this._cached : this._orig));
        sj.add(((isBlank(this._cached)) ? ' unevaluated' : ''));
        sj.add(')');
        return sj.toString();
    }
}
class StaticallyResolvableWrapper extends StaticallyResolvable {
    /**
     * @param {?} _orig
     */
    constructor(_orig) {
        super();
        this._orig = _orig;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        return this._orig.evaluate(context);
    }
    /**
     * @return {?}
     */
    toString() {
        let /** @type {?} */ sj = new StringJoiner(['StaticallyResolvableWrapper']);
        sj.add('(');
        sj.add(this._orig.toString());
        sj.add(')');
        return sj.toString();
    }
}
class ContextFieldPath extends DynamicPropertyValue {
    /**
     * @param {?} path
     */
    constructor(path) {
        super();
        this.settable = true;
        this.fieldPath = new FieldPath(path);
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        return this.fieldPath.getFieldValue(context);
    }
    /**
     * @param {?} context
     * @param {?} value
     * @return {?}
     */
    evaluateSet(context, value) {
        this.fieldPath.setFieldValue(context, value);
    }
}
/**
 * @param {?} arg
 * @return {?}
 */
function isDynamicSettable(arg) {
    return isPresent(arg.settable);
}
class Expr extends DynamicPropertyValue {
    /**
     * @param {?} _expressionString
     */
    constructor(_expressionString) {
        super();
        this._expressionString = _expressionString;
        this._extendedObjects = new Map();
        this.addTypeToContext('Meta', Meta);
        this.addTypeToContext('FieldPath', FieldPath);
    }
    /**
     * @param {?} name
     * @param {?} context
     * @return {?}
     */
    addTypeToContext(name, context) {
        if (isFunction(context)) {
            this._extendedObjects.set(name, context);
        }
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        let /** @type {?} */ index = 0;
        this._extendedObjects.forEach((v, k) => {
            const /** @type {?} */ typeName = `DynObj${index++}`;
            (/** @type {?} */ (context))[typeName] = v;
            if (this._expressionString.indexOf(`${k}.`) !== -1) {
                this._expressionString = this._expressionString.replace(`${k}.`, `${typeName}.`);
            }
        });
        let /** @type {?} */ result = evalExpressionWithCntx(this._expressionString, '', context, context);
        index = 0;
        this._extendedObjects.forEach((v, k) => {
            const /** @type {?} */ typeName = `DynObj${index++}`;
            if (isPresent((/** @type {?} */ (context))[typeName])) {
                delete (/** @type {?} */ (context))[typeName];
                // check if we can use undefined. Delete is pretty slow
            }
        });
        return result;
    }
    /**
     * @return {?}
     */
    toString() {
        let /** @type {?} */ sj = new StringJoiner(['expr:']);
        sj.add('(');
        sj.add(this._expressionString);
        sj.add(')');
        return sj.toString();
    }
}
class DeferredOperationChain extends DynamicPropertyValue {
    /**
     * @param {?} _merger
     * @param {?} _orig
     * @param {?} _override
     */
    constructor(_merger, _orig, _override) {
        super();
        this._merger = _merger;
        this._orig = _orig;
        this._override = _override;
        this.propertyAwaking = true;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        return this._merger.merge(context.resolveValue(this._override), context.resolveValue(this._orig), context.isDeclare());
    }
    /**
     * @param {?} map
     * @return {?}
     */
    awakeForPropertyMap(map) {
        let /** @type {?} */ orig = this._orig;
        let /** @type {?} */ over = this._override;
        if (isPropertyMapAwaking(orig)) {
            orig = (/** @type {?} */ (orig)).awakeForPropertyMap(map);
        }
        if (isPropertyMapAwaking(over)) {
            over = (/** @type {?} */ (over)).awakeForPropertyMap(map);
        }
        if (orig !== this._orig || over !== this._override) {
            return new DeferredOperationChain(this._merger, orig, over);
        }
        return this;
    }
    /**
     * @return {?}
     */
    toString() {
        let /** @type {?} */ sj = new StringJoiner(['Chain']);
        sj.add('<');
        sj.add(this._merger.toString());
        sj.add('>');
        sj.add(': ');
        sj.add(this._override);
        sj.add(' => ');
        sj.add(this._orig);
        return sj.toString();
    }
}
class ValueConverter {
    /**
     * @param {?} toType
     * @param {?} value
     * @return {?}
     */
    static value(toType, value) {
        if (toType === 'String') {
            if (isBlank(value) || isString(value)) {
                return value;
            }
            return value.toString();
        }
        else if (toType === 'Boolean') {
            if (isBlank(value) || isBoolean(value)) {
                return value;
            }
            return BooleanWrapper.boleanValue(value);
        }
        else if (toType === 'Number') {
            if (isBlank(value) || isNumber(value)) {
                return value;
            }
            // ignore dec. points for now
            return parseInt(value.toString());
        }
        return value;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 *
 * Context represents a stack of assignments (e.g. class=User, field=birthDay, operation=edit)
 *  The current set of assignments can be retrieved via values().
 *
 * The current values are run against the Meta rule set to compute the effective PropertyMap
 * (e.g. visible:true, editable:true, component:AWTextField).
 * Some rule evaluations result in *chaining* -- where additional assignments that are
 * 'implied' by the current assignments are applied, (resulting in a revised computation
 * of the current PropertyMap, and possible further chaining).
 * (e.g. field=birthDay may result in type=Date which may result in component:DatePicker)
 *
 * Assignments can be scoped and popped (push(), set(key, value); ...; pop()).
 *
 * The actual computation of rule matches is cached so once a 'path' down the context
 * tree has been exercized subsequent matching traversals (even by other threads/users)
 * is fast.
 *
 *
 * examples of property maps for different scope key
 *
 * <code>
 *     {
 * 'visible': true,
 * 'class_trait': 'fiveZones',
 * 'editable': true,
 * 'bindings': {
 * 'value': 'Default Title'
 * },
 * 'field_trait': 'required',
 * 'label': 'Title',
 * 'type': 'string',
 * 'required': true,
 * 'editing': true,
 * 'valid': '{{(value && value.length > 0) ? true : \'Answer required\'}}',
 * 'component': 'InputFieldComponent',
 * 'field': 'title',
 * 'layout_trait': 'Form',
 * 'trait': 'required',
 * 'rank': 20,
 * 'after': 'zLeft',
 * 'class': 'CheckRequest1'
 * }
 *
 * </code>
 *
 *
 *
 * <code>
 *     {
 * 'visible': true,
 * 'class_trait': 'fiveZones',
 * 'label': 'Check Request1',
 * 'zones': [
 * 'zLeft',
 * 'zRight',
 * 'zTop',
 * 'zBottom',
 * 'zDetail'
 * ],
 * 'editing': true,
 * 'layout': '*',
 * 'component': 'MetaFormComponent',
 * 'layout_trait': 'Form',
 * 'fiveZoneLayout': true,
 * 'trait': 'fiveZones',
 * 'layoutsByZone': {
 * },
 * 'class': 'CheckRequest1',
 * 'fieldsByZone': {
 * 'zLeft': [
 * 'title',
 * 'name'
 * ],
 * 'zNone': [
 * 'fullName'
 * ]
 * }
 * }
 *
 * </code>
 *
 *
 *
 */
class Context extends Extensible {
    /**
     * @param {?} _meta
     * @param {?=} nested
     */
    constructor(_meta, nested = false) {
        super();
        this._meta = _meta;
        this.nested = nested;
        this._values = new Map();
        this._entries = [];
        this._frameStarts = [];
        this._recPool = [];
        if (isBlank(Context.EmptyMap)) {
            Context.EmptyMap = new PropertyMap();
        }
        Context._Debug_SetsCount = 0;
        this._accessor = new PropertyAccessor(this);
        this._currentActivation = Context.getActivationTree(_meta);
        this._rootNode = this._currentActivation;
        this.isNested = nested;
    }
    /**
     * Implementation notes:
     *
     * Context maintains a stack (_entries) of _ContextRecs (one per assignment) as well as
     * as _frameStack recording the stack positions for each push()/pop().
     * Performance through aggressive global caching of all statically computatble data:
     * - The static (reusable/immutable) part of a ContextRec is factored into _StaticRec
     * - StaticRecs represent individual assignments (context key = value) and cache the
     *      resulting Meta.MatchResult (and associated PropertyMap)
     * - The sub-stack (of forward chained) records associated with each external set()
     *      (or chained *dynamic* value) is recorded in an Activation.
     * - Process-global tree of Activations
     *      - each activation keeps list of its ContextKey/Value-keyed decended Activations
     *
     * Property Contexts.
     *      The notion of a 'PropertyContext' makes the going tricky...
     *       A 'PropertyContextKey' is a key for an 'entity' that properties describe.
     *       (e.g. class, field, action, and layout are property context keys, but editing,
     *       operation, ... are not)
     *       E.g. On an assignment stack with module=Admin class=Foo, field=name, editable=false,
     *       we want the property 'label' to be the label for the *field*, not the class or module
     *       -- i.e. the *top-most* assignment of a PropertyContextKey determines which property
     *       context rules are active.
     *
     *  These rules are activated via a synthetic context key of like 'field_p' or 'class_p'.
     *  Logically, after each assigment we need to figure of which context key should be in
     *  affect an set it on the context, but then automatically pop it off upon the next
     *  assignment (and then recompute again).
     *
     *  Of course, actually pushing and popping context key assignment on every set()
     *  would be expensive so instead we cache the 'propertyActivation' associated with
     *  each activation, and use its values and properties rather than those on the
     *  activation.
     * @param {?} meta
     * @return {?}
     */
    static getActivationTree(meta) {
        // todo: check the syntax Actionvation contructor name.
        let /** @type {?} */ name = objectToName(Activation);
        let /** @type {?} */ root = meta.identityCache.getValue(name);
        if (isBlank(root)) {
            root = new Activation();
            meta.identityCache.setValue(name, root);
        }
        return root;
    }
    /**
     * @return {?}
     */
    push() {
        this._frameStarts.push(this._entries.length);
    }
    /**
     * @return {?}
     */
    get meta() {
        return this._meta;
    }
    /**
     * @return {?}
     */
    pop() {
        let /** @type {?} */ size = this._frameStarts.length;
        assert(size > 0, 'Popping empty stack');
        let /** @type {?} */ pos = this._frameStarts.pop();
        let /** @type {?} */ entriesSize;
        while ((entriesSize = this._entries.length) > pos) {
            let /** @type {?} */ recIdx = entriesSize - 1;
            let /** @type {?} */ rec = this._entries.splice(recIdx, 1)[0];
            if (rec.srec.lastAssignmentIdx === -1) {
                this._values.delete(rec.srec.key);
            }
            else {
                this._undoOverride(rec, recIdx);
            }
            this._currentActivation = (recIdx > 0)
                ? this._entries[recIdx - 1].srec.activation
                : this._rootNode;
            this.assertContextConsistent();
            // check rec back into pool for reuse
            rec.reset();
            this._recPool.push(rec);
        }
        this._currentProperties = null;
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    set(key, value) {
        this._set(key, value, false, false);
        // implement default toString for our object so we can retrieve objectTitle
        if (key === ObjectMeta.KeyObject) {
            let /** @type {?} */ toCheck = this._values.get(ObjectMeta.KeyObject);
            if (isBlank(toCheck['$toString'])) {
                toCheck['$toString'] = () => {
                    let /** @type {?} */ clazz = this.values.get(ObjectMeta.KeyClass);
                    return UIMeta.beautifyClassName(clazz);
                };
            }
        }
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    merge(key, value) {
        this._set(key, value, true, false);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    setScopeKey(key) {
        assert(this._meta.keyData(key).isPropertyScope, key + ' is not a valid context key');
        let /** @type {?} */ current = this._currentPropertyScopeKey();
        // Assert.that(current != null, 'Can't set %s as context key when no context key on stack',
        // key); TODO: if current key isChaining then we need to set again to get a non-chaining
        // assignment
        if (!(key === current)) {
            let /** @type {?} */ val = this.values.get(key);
            // Assert.that(val != null, 'Can't set %s as context key when it has no value already
            // on the context', key);
            if (isBlank(val)) {
                val = Meta.KeyAny;
            }
            this.set(key, val);
        }
    }
    /**
     * @return {?}
     */
    get values() {
        let /** @type {?} */ propVals;
        return (ListWrapper.isEmpty(this._entries) ||
            isBlank(propVals = (ListWrapper.last(this._entries)).propertyLocalValues(this))) ? this._values : propVals;
    }
    /**
     * @return {?}
     */
    get properties() {
        return this._accessor;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    propertyForKey(key) {
        let /** @type {?} */ val = this.allProperties().get(key);
        return this.resolveValue(val);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    listPropertyForKey(key) {
        let /** @type {?} */ val = this.propertyForKey(key);
        return (isBlank(val)) ? [] : (isArray(val)) ? val : [val];
    }
    /**
     * @param {?} key
     * @param {?} defaultVal
     * @return {?}
     */
    booleanPropertyForKey(key, defaultVal) {
        let /** @type {?} */ val = this.propertyForKey(key);
        return (isBlank(val)) ? defaultVal : BooleanWrapper.boleanValue(val);
    }
    /**
     * @return {?}
     */
    allProperties() {
        if (isBlank(this._currentProperties)) {
            let /** @type {?} */ m = this.lastMatch();
            if (isPresent(m)) {
                this._currentProperties = m.properties();
            }
        }
        return isPresent(this._currentProperties) ? this._currentProperties : Context.EmptyMap;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    resolveValue(value) {
        let /** @type {?} */ lastValue;
        while (value !== lastValue && isPresent(value) && value instanceof DynamicPropertyValue) {
            lastValue = value;
            let /** @type {?} */ propValue = value;
            if (propValue instanceof Expr) {
                propValue.addTypeToContext('UIMeta', UIMeta);
            }
            value = propValue.evaluate(this);
        }
        return value;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    staticallyResolveValue(value) {
        let /** @type {?} */ lastValue = null;
        while (value !== lastValue && isPresent(value) && value instanceof StaticallyResolvable) {
            lastValue = value;
            value = value.evaluate(this);
        }
        return value;
    }
    /**
     * @param {?} contextVals
     * @param {?} propertyKey
     * @param {?} staticResolve
     * @return {?}
     */
    pushAndResolveStatic(contextVals, propertyKey, staticResolve) {
        let /** @type {?} */ scopeKey;
        this.push();
        MapWrapper.iterable(contextVals).forEach((value, key) => {
            if ('*' === value) {
                scopeKey = key;
            }
            else {
                this.set(key, value);
            }
        });
        if (isPresent(scopeKey)) {
            this.setScopeKey(scopeKey);
        }
        let /** @type {?} */ val = this.allProperties().get(propertyKey);
        val = staticResolve ? this.staticallyResolveValue(val) : this.resolveValue(val);
        this.pop();
        return val;
    }
    /**
     * @param {?} contextVals
     * @param {?} propertyKey
     * @return {?}
     */
    pushAndResolve(contextVals, propertyKey) {
        return this.pushAndResolveStatic(contextVals, propertyKey, false);
    }
    /**
     * @return {?}
     */
    snapshot() {
        return new Snapshot(this);
    }
    /**
     * Represent current active assignment list meaning it will not include any entries which
     * were overwritten by some late entry having the same key.
     *
     * It does not include entries that were pushed to stack from any Property -> Selector
     * propagation. This creates shell copy and ignoring all last Matches which could be from
     * some previous assignments that are now replaced with some new ones
     *
     * @return {?}
     */
    activeAssignments() {
        let /** @type {?} */ list = new Array();
        for (let /** @type {?} */ i = 0, /** @type {?} */ c = this._entries.length; i < c; i++) {
            let /** @type {?} */ rec = this._entries[i];
            if (rec.maskedByIdx === 0 && !rec.srec.fromChaining) {
                let /** @type {?} */ a = new AssignmentSnapshot();
                a.key = rec.srec.key;
                a.value = rec.val;
                a.salience = rec.srec.salience;
                list.push(a);
            }
        }
        return list;
    }
    /**
     *
     * Similar as <code>activeAssignments</code> but do include also those that were replaced later
     * on with assignments having the same key.
     *
     * This is needed for cases where we need to have deep copy of current state along with
     * all properties.
     *
     * @return {?}
     */
    allAssignments() {
        let /** @type {?} */ list = new Array();
        for (let /** @type {?} */ i = 0, /** @type {?} */ c = this._entries.length; i < c; i++) {
            let /** @type {?} */ rec = this._entries[i];
            if (!rec.srec.fromChaining) {
                let /** @type {?} */ a = new AssignmentSnapshot();
                a.key = rec.srec.key;
                a.value = rec.val;
                a.salience = rec.srec.salience;
                list.push(a);
            }
        }
        return list;
    }
    /**
     * @param {?} key
     * @param {?} value
     * @param {?} merge
     * @param {?} chaining
     * @return {?}
     */
    _set(key, value, merge, chaining) {
        let /** @type {?} */ sval = this._meta.transformValue(key, value);
        let /** @type {?} */ didSet = false;
        let /** @type {?} */ registry = (/** @type {?} */ (this.meta)).componentRegistry;
        if (key === ObjectMeta.KeyObject && isPresent(registry)) {
            registry.registerType(className(value), value.constructor);
        }
        let /** @type {?} */ activation = this._currentActivation.getChildActivation(key, sval, chaining);
        if (isBlank(activation)) {
            didSet = this._createNewFrameForSet(key, sval, value, merge, chaining);
        }
        if (isPresent(activation)) {
            didSet = this._applyActivation(activation, value);
        }
        if (didSet) {
            this.awakeCurrentActivation();
        }
    }
    /**
     * @return {?}
     */
    newContextRec() {
        let /** @type {?} */ count = this._recPool.length;
        return (count > 0) ? this._recPool.splice(count - 1, 1)[0] : new Assignment();
    }
    /**
     * Cached case: apply a previously computed Activation
     * @param {?} activation
     * @param {?} firstVal
     * @return {?}
     */
    _applyActivation(activation, firstVal) {
        assert(activation._parent === this._currentActivation, 'Attempt to apply activation on mismatched parent');
        if (this._entries.length !== activation._origEntryCount) {
            assert(false, 'Mismatched context stack size (%s) from when activation was popped ' +
                this._entries.length + ' ' + activation._origEntryCount);
        }
        let /** @type {?} */ count = activation._recs.length;
        if (count === 0) {
            return false;
        }
        for (let /** @type {?} */ i = 0; i < count; i++) {
            let /** @type {?} */ srec = activation._recs[i];
            let /** @type {?} */ rec = this.newContextRec();
            rec.srec = srec;
            // Apply masking for any property that we mask out
            if (srec.lastAssignmentIdx !== -1) {
                this._prepareForOverride(this._entries.length, srec.lastAssignmentIdx);
            }
            rec.val = (i === 0 && !this.meta.isNullMarker(firstVal)) ? firstVal : srec.val;
            this._values.set(srec.key, rec.val);
            this._entries.push(rec);
        }
        this._currentActivation = activation;
        this._currentProperties = null;
        return true;
    }
    /**
     * @return {?}
     */
    awakeCurrentActivation() {
        // See if this activation requires further chaining
        let /** @type {?} */ currentActivation = this._currentActivation;
        let /** @type {?} */ deferredAssignments = currentActivation.deferredAssignments;
        if (isPresent(deferredAssignments)) {
            this.applyDeferredAssignments(deferredAssignments);
        }
    }
    /**
     * @param {?} deferredAssignments
     * @return {?}
     */
    applyDeferredAssignments(deferredAssignments) {
        for (let /** @type {?} */ da of deferredAssignments) {
            // verify that deferred value still applies
            let /** @type {?} */ currentPropValue = this.staticallyResolveValue(this.allProperties().get(da.key));
            if (da.value === currentPropValue) {
                let /** @type {?} */ resolvedValue = this.resolveValue(da.value);
                this._set(da.key, resolvedValue, false, true);
            }
        }
    }
    /**
     * @return {?}
     */
    _inDeclare() {
        let /** @type {?} */ match = this.lastMatchWithoutContextProps();
        return isPresent(match) && (match._keysMatchedMask & this._meta.declareKeyMask) !== 0;
    }
    /**
     * Non-cached access: create a new activation
     * @param {?} key
     * @param {?} svalue
     * @param {?} value
     * @param {?} merge
     * @param {?} chaining
     * @return {?}
     */
    _createNewFrameForSet(key, svalue, value, merge, chaining) {
        let /** @type {?} */ lastActivation = this._currentActivation;
        let /** @type {?} */ newActivation = new Activation(lastActivation);
        newActivation._origEntryCount = this._entries.length;
        this._currentActivation = newActivation;
        // set this value
        let /** @type {?} */ didSet = this._set2(key, svalue, value, merge, chaining);
        // mirror properties
        if (didSet) {
            while (this._checkApplyProperties()) {
                /* repeat */
            }
        }
        // Remember for the future
        if (Context._CacheActivations) {
            lastActivation.cacheChildActivation(key, svalue, newActivation, chaining);
        }
        this._currentActivation = (didSet) ? newActivation : lastActivation;
        return this._currentActivation !== lastActivation;
    }
    /**
     * Called lazily to compute the property activation for this activation
     * Compute the static part of the property activation
     * we accumulate the property settings on a side activation off the main stack
     * and apply it virtually if our parent is not covered
     *  (that way we don't have to apply and unapply all the time)
     * @param {?} parentActivation
     * @return {?}
     */
    _createNewPropertyContextActivation(parentActivation) {
        this.push();
        let /** @type {?} */ propActivation = new Activation(parentActivation);
        propActivation._origEntryCount = this._entries.length;
        this._currentActivation = propActivation;
        let /** @type {?} */ origValues = this._values;
        let /** @type {?} */ nestedMap = new NestedMap(origValues);
        this._values = nestedMap;
        this.applyPropertyContextAndChain();
        if (propActivation._recs.length > 0 || isPresent(propActivation.deferredAssignments)) {
            propActivation._nestedValues = nestedMap;
            this._values = Context.EmptyRemoveMap; // hack -- empty map so that undo is noop --
            // ((NestedMap)_values).dup();
        }
        else {
            propActivation = null;
        }
        this.pop();
        this._values = origValues;
        this._currentActivation = parentActivation;
        return propActivation;
    }
    /**
     * @param {?} propActivation
     * @param {?} rec
     * @return {?}
     */
    _applyPropertyActivation(propActivation, rec) {
        let /** @type {?} */ propValues = this._values;
        if (isPresent(propActivation._nestedValues)) {
            propValues = propActivation._nestedValues.reparentedMap(propValues);
        }
        // set up propLocal results
        // Now, see if we need to compute a dynamic property activation as well
        if (isPresent(propActivation.deferredAssignments)) {
            this.push();
            // nest a dynamic nested map on our static nested map (which is on our last dynamic
            // nested map...)
            let /** @type {?} */ origValues = this._values;
            this._values = new NestedMap(propValues);
            this._applyActivation(propActivation, Meta.NullMarker);
            this.applyDeferredAssignments(propActivation.deferredAssignments);
            rec._propertyLocalValues = this._values;
            rec._propertyLocalSrec = ListWrapper.last(this._entries).srec;
            this._values = Context.EmptyRemoveMap; // hack -- empty map so that undo is noop --
            // ((NestedMap)_values).dup();
            this.pop();
            this._values = origValues;
        }
        else {
            // can use static versions
            rec._propertyLocalValues = propValues;
            rec._propertyLocalSrec = ListWrapper.last(propActivation._recs);
        }
    }
    /**
     * @param {?} oldVal
     * @param {?} newVal
     * @return {?}
     */
    _isNewValue(oldVal, newVal) {
        return (oldVal !== newVal && (isPresent(oldVal) ||
            (!oldVal === newVal && (!isArray(oldVal)) || !(ListWrapper.contains(oldVal, newVal)))));
    }
    /**
     * @return {?}
     */
    isDeclare() {
        return isPresent(this.propertyForKey(Meta.KeyDeclare));
    }
    /**
     * @return {?}
     */
    assertContextConsistent() {
        if (!Context._ExpensiveContextConsistencyChecksEnabled) {
            return;
        }
        // Verify that each value in context has matching (enabled) context record
        MapWrapper.iterable(this._values).forEach((value, key) => {
            let /** @type {?} */ lastAssignmentIdx = this.findLastAssignmentOfKey(key);
            assert(lastAssignmentIdx >= 0, 'Value in context but no assignment record found ' +
                key + ' = ' + value);
            let /** @type {?} */ contextVal = this._entries[lastAssignmentIdx].val;
            assert(value === contextVal || (isPresent(value) && value === contextVal), 'Value in context  doesnt match value on stack ' + value + ' / ' + contextVal);
        });
        // check entries for proper relationship with any previous records that they override
        for (let /** @type {?} */ i = this._entries.length - 1; i >= 0; i--) {
            let /** @type {?} */ r = this._entries[i];
            let /** @type {?} */ foundFirst = false;
            for (let /** @type {?} */ j = i - 1; j >= 0; j--) {
                let /** @type {?} */ pred = this._entries[j];
                if (pred.srec.key === r.srec.key) {
                    // Predecessors must be masked
                    assert((!foundFirst && pred.maskedByIdx === i) ||
                        ((foundFirst || pred.srec.fromChaining) && pred.maskedByIdx > 0), 'Predecessor A does not have matching maskedByIdx B  for override C:' +
                        pred.srec.key + ' = ' + pred.val + ', ' + pred.maskedByIdx + ', ' +
                        i + ' = ' + r.val);
                    assert(((!foundFirst && r.srec.lastAssignmentIdx === j) || foundFirst ||
                        pred.srec.fromChaining), 'Override A1=A2 does not have proper lastAssignmentIdx B1!=B2 ' +
                        'for predecessor C' +
                        pred.srec.key + ' = ' + pred.val + ', ' + r.srec.lastAssignmentIdx + ' = ' +
                        j + ', ' + pred.val);
                    foundFirst = true;
                }
            }
        }
    }
    /**
     * @param {?} key
     * @param {?} svalue
     * @param {?} value
     * @param {?} merge
     * @param {?} isChaining
     * @return {?}
     */
    _set2(key, svalue, value, merge, isChaining) {
        Context._Debug_SetsCount++;
        // print('Setting key/vale onto stack: ' + key + '=' + value);
        let /** @type {?} */ hasOldValue = this._values.has(key) && isPresent(this._values.get(key));
        let /** @type {?} */ oldVal = hasOldValue ? this._values.get(key) : null;
        let /** @type {?} */ isNewValue = !hasOldValue || this._isNewValue(oldVal, value);
        let /** @type {?} */ matchingPropKeyAssignment = !isNewValue && !isChaining &&
            ((this._meta.keyData(key).isPropertyScope) &&
                key !== this._currentPropertyScopeKey());
        if (isNewValue || matchingPropKeyAssignment) {
            let /** @type {?} */ lastMatch;
            let /** @type {?} */ newMatch;
            let /** @type {?} */ salience = this._frameStarts.length;
            let /** @type {?} */ lastAssignmentIdx = -1;
            if (isBlank(oldVal)) {
                lastMatch = this.lastMatchWithoutContextProps();
            }
            else {
                // We recompute that match up to this point by recomputing forward
                // from the point of the last assignment to this key (skipping it), then
                // match against the array of our value and the old
                let /** @type {?} */ recIdx = this._entries.length;
                lastAssignmentIdx = this.findLastAssignmentOfKey(key);
                assert(lastAssignmentIdx >= 0, 'Value in context but no assignment record found ' + key + ' = ' + oldVal);
                if (matchingPropKeyAssignment) {
                    // cheap version of masking for a matching set:
                    this._entries[lastAssignmentIdx].maskedByIdx = recIdx;
                    lastMatch = this.lastMatchWithoutContextProps();
                }
                else {
                    // be able to override a non-chaining assignment.  Our problem is, though, if
                    // the developer wanted to force a re-assignment in the new frame, we'd filter
                    // it out as a duplicate assignment above.  Now, we could allow that assignment
                    // through, but it would then break inletiants when searching back to mask a
                    // key (we wouldn't realize that we need to go further back to find the
                    // original one).
                    let /** @type {?} */ oldRec = this._entries[lastAssignmentIdx];
                    if (oldRec.srec.salience === salience) {
                        let /** @type {?} */ prev = this.findLastAssignmentOfKeyWithValue(key, value);
                        if (prev !== -1 && this._entries[prev].srec.salience === salience) {
                            return false;
                        }
                    }
                    if (isChaining &&
                        (oldRec.srec.salience > salience || !oldRec.srec.fromChaining)) {
                        // print('Set of key skipped (salience %s <= %s)' + key + ', ' + oldVal +
                        // ', ' + value + ', ' + salience + ', ' + oldRec.srec.salience);
                        return false;
                    }
                    let /** @type {?} */ firstAssignmentIdx = this._prepareForOverride(recIdx, lastAssignmentIdx);
                    newMatch = this._rematchForOverride(key, svalue, recIdx, firstAssignmentIdx);
                    if (merge) {
                        value = Meta.PropertyMerger_List.merge(oldVal, value, this.isDeclare());
                    }
                }
            }
            assert(this._entries.length <= Context.MaxContextStackSize, 'MetaUI context stack exceeded max size -- likely infinite chaining: ' +
                this._entries.length);
            let /** @type {?} */ srec = new StaticRec();
            srec.key = key;
            // todo: conversion
            srec.val = svalue;
            srec.lastAssignmentIdx = lastAssignmentIdx;
            srec.salience = salience;
            srec.fromChaining = isChaining;
            if (isBlank(newMatch)) {
                newMatch = (isPresent(value)) ? this._meta.match(key, svalue, lastMatch) : lastMatch;
            }
            srec.match = newMatch;
            srec.activation = this._currentActivation;
            this._currentActivation._recs.push(srec);
            let /** @type {?} */ rec = this.newContextRec();
            rec.srec = srec;
            rec.val = value;
            this._entries.push(rec);
            this._currentProperties = null;
            this._values.set(key, value);
            // console.log( this.debugName + ' => ' +
            //     'Push(' + key + ', ' + svalue + '): ' + 'Matches: ' + newMatch.matches().length
            //     + ', PropMap: ' + srec.properties().size);
            if (Context._DebugRuleMatches) {
                this._checkMatch(srec.match, key, value);
            }
            this.assertContextConsistent();
            return true;
        }
        else {
            // print('Context skipped assignment of matching property value %s = %s (isChaining ==
            // %s, isPropKey == %s)', key, value, isChaining,
            // (this._meta.keyData(key).isPropertyScope));
            if (!isChaining && this.meta.keyData(key).isPropertyScope) ;
        }
        return false;
    }
    /**
     * @return {?}
     */
    get frameStarts() {
        return this._frameStarts;
    }
    /**
     * @param {?} rec
     * @return {?}
     */
    _undoRecValue(rec) {
        if (rec.srec.lastAssignmentIdx === -1 ||
            this._entries[rec.srec.lastAssignmentIdx].maskedByIdx > 0) {
            this._values.delete(rec.srec.key);
        }
        else {
            this._values.set(rec.srec.key, this._entries[rec.srec.lastAssignmentIdx].val);
        }
    }
    /**
     * @param {?} overrideIndex
     * @param {?} lastAssignmentIdx
     * @return {?}
     */
    _prepareForOverride(overrideIndex, lastAssignmentIdx) {
        // if we're overriding a prop context override of a matching value, back up further
        let /** @type {?} */ lastLastIdx = 0;
        while (((lastLastIdx = this._entries[lastAssignmentIdx].srec.lastAssignmentIdx) !== -1) &&
            (this._entries[lastAssignmentIdx].maskedByIdx <= 0)) {
            // mark it! (we'll pick it up below...)
            this._entries[lastAssignmentIdx].maskedByIdx = -1;
            lastAssignmentIdx = lastLastIdx;
        }
        // undo all conflicting or dervied assignments (and mark them)
        for (let /** @type {?} */ i = this._entries.length - 1; i >= lastAssignmentIdx; i--) {
            let /** @type {?} */ r = this._entries[i];
            // we need to undo (and mask) any record that conflict or are derived
            // NOTE: We are skipping the remove all chained records, because this can result in
            // undoing derived state totally unrelated to this key.  Ideally we'd figure out what
            // depended on what...
            if (r.maskedByIdx <= 0 && (i === lastAssignmentIdx || r.maskedByIdx === -1)) {
                // || r.srec.fromChaining
                // mark and undo it
                r.maskedByIdx = overrideIndex;
                this._undoRecValue(r);
            }
        }
        return lastAssignmentIdx;
    }
    /**
     * @param {?} key
     * @param {?} svalue
     * @param {?} overrideIndex
     * @param {?} firstAssignmentIdx
     * @return {?}
     */
    _rematchForOverride(key, svalue, overrideIndex, firstAssignmentIdx) {
        // start from the top down looking for that last unmasked record
        let /** @type {?} */ lastMatch;
        let /** @type {?} */ i = 0;
        for (; i < firstAssignmentIdx; i++) {
            let /** @type {?} */ rec = this._entries[i];
            if (rec.maskedByIdx !== 0) {
                break;
            }
            lastMatch = rec.srec.match;
        }
        let /** @type {?} */ overridesMatch;
        // Rematch skipping over the last assignment of this property
        // and all assignments from chainging
        for (let /** @type {?} */ end = this._entries.length; i < end; i++) {
            let /** @type {?} */ r = this._entries[i];
            // rematch on any unmasked records
            if (r.maskedByIdx === 0) {
                lastMatch = this._meta.match(r.srec.key, r.srec.val, lastMatch);
            }
            else {
                // accumulate masked ('_o') match
                overridesMatch = this._meta.unionOverrideMatch(r.srec.key, r.srec.val, overridesMatch);
            }
        }
        if (isPresent(svalue) || isBlank(lastMatch)) {
            lastMatch = this._meta.match(key, svalue, lastMatch);
        }
        lastMatch.setOverridesMatch(overridesMatch);
        return lastMatch;
    }
    /**
     * @param {?} rec
     * @param {?} recIdx
     * @return {?}
     */
    _undoOverride(rec, recIdx) {
        let /** @type {?} */ lastAssignmentIdx = rec.srec.lastAssignmentIdx;
        let /** @type {?} */ lastLastIdx;
        // bastick up further if necessary
        while (((lastLastIdx = this._entries[lastAssignmentIdx].srec.lastAssignmentIdx) !== -1) &&
            (this._entries[lastLastIdx].maskedByIdx === recIdx)) {
            lastAssignmentIdx = lastLastIdx;
        }
        for (let /** @type {?} */ i = lastAssignmentIdx, /** @type {?} */ c = this._entries.length; i < c; i++) {
            let /** @type {?} */ r = this._entries[i];
            if (r.maskedByIdx === recIdx) {
                this._values.set(r.srec.key, r.val);
                r.maskedByIdx = 0;
            }
        }
    }
    /**
     * @param {?} match
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    _checkMatch(match, key, value) {
        match._checkMatch(this._values, this._meta);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    findLastAssignmentOfKey(key) {
        for (let /** @type {?} */ i = this._entries.length - 1; i >= 0; i--) {
            let /** @type {?} */ rec = this._entries[i];
            if (rec.srec.key === key && rec.maskedByIdx === 0) {
                return i;
            }
        }
        return -1;
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    findLastAssignmentOfKeyWithValue(key, value) {
        for (let /** @type {?} */ i = this._entries.length - 1; i >= 0; i--) {
            let /** @type {?} */ rec = this._entries[i];
            if (rec.srec.key === key && !this._isNewValue(rec.val, value)) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Check if we have value mirroring (property to context) to do Dynamic property mirroring will
     * be added to the currentActivation deferredAssignment list
     *
     * @return {?}
     */
    _checkApplyProperties() {
        let /** @type {?} */ didSet = false;
        let /** @type {?} */ numEntries = 0;
        let /** @type {?} */ lastSize = 0;
        let /** @type {?} */ declareKey = this._inDeclare() ? this._values.get(Meta.KeyDeclare) : null;
        while ((numEntries = this._entries.length) > lastSize) {
            lastSize = numEntries;
            let /** @type {?} */ rec = this._entries[numEntries - 1];
            let /** @type {?} */ properties = rec.srec.properties();
            let /** @type {?} */ contextKeys = properties.contextKeysUpdated;
            if (isPresent(contextKeys)) {
                for (let /** @type {?} */ i = 0, /** @type {?} */ c = contextKeys.length; i < c; i++) {
                    let /** @type {?} */ propMgr = contextKeys[i];
                    let /** @type {?} */ key = propMgr._name;
                    if (isPresent(declareKey) && key === declareKey) {
                        continue;
                    }
                    // ToDo: applying resolved value -- need to defer resolution on true dynamic
                    // values Suppress chained assignment if: 1) Our parent will assign this
                    // property (has a deferred activation for it), or 2) There's already a
                    // matching assignment with higher salience
                    let /** @type {?} */ newVal = this.staticallyResolveValue(properties.get(key));
                    let /** @type {?} */ prevProps;
                    let /** @type {?} */ suppress = (isPresent(prevProps) && prevProps.has(key)
                        && !this._isNewValue(this.staticallyResolveValue(prevProps.get(key)), newVal)) ||
                        (this._currentActivation._parent.hasDeferredAssignmentForKey(key));
                    if (!suppress) {
                        let /** @type {?} */ mirrorKey = propMgr._keyDataToSet._key;
                        if (newVal instanceof DynamicPropertyValue) {
                            // print('(deferred) chaining key: ' , propMgr._keyDataToSet._key);
                            this._currentActivation.addDeferredAssignment(mirrorKey, newVal);
                        }
                        else {
                            // compare this value to the value from the end of the last frame
                            // print('chaining key: ' , propMgr._keyDataToSet._key);
                            if (this._set2(mirrorKey, newVal, newVal, false, true)) {
                                didSet = true;
                            }
                        }
                    }
                }
            }
        }
        return didSet;
    }
    /**
     * @return {?}
     */
    applyPropertyContextAndChain() {
        if (this._checkPropertyContext()) {
            while (this._checkApplyProperties()) {
                /* repeat */
            }
        }
    }
    /**
     * @return {?}
     */
    _currentPropertyScopeKey() {
        let /** @type {?} */ foundKey;
        let /** @type {?} */ foundActivation;
        for (let /** @type {?} */ i = this._entries.length - 1; i >= 0; i--) {
            let /** @type {?} */ rec = this._entries[i];
            if (isPresent(foundActivation) && rec.srec.activation !== foundActivation) {
                break;
            }
            if (this._meta.keyData(rec.srec.key).isPropertyScope) {
                if (!rec.srec.fromChaining) {
                    return rec.srec.key;
                }
                // for chaining assignments, we keep looking until we exhaust the first
                // non-chaining activation Todo: broken -- disabling set of context key from
                // chaining if (foundKey === null) foundKey = scopeKey;
            }
            if (isPresent(foundKey) && !rec.srec.fromChaining) {
                foundActivation = rec.srec.activation;
            }
        }
        return foundKey;
    }
    /**
     * @return {?}
     */
    _checkPropertyContext() {
        assert(this._values instanceof NestedMap, 'Property assignment on base map?');
        let /** @type {?} */ scopeKey = this._currentPropertyScopeKey();
        if (isPresent(scopeKey)) {
            return this._set2(Meta.ScopeKey, scopeKey, scopeKey, false, false);
        }
        return false;
    }
    /**
     * @return {?}
     */
    debug() {
        // set debugger breakpoint here
        print('******  Debug Call ******');
        this._logContext();
    }
    /**
     * @return {?}
     */
    debugString() {
        let /** @type {?} */ buffer = new StringJoiner(['<b>Context:</b>&nbsp;']);
        buffer.add('(&nbsp;');
        buffer.add(this._entries.length + '');
        buffer.add(' entries');
        buffer.add('&nbsp;)<br/>');
        for (let /** @type {?} */ i = 0, /** @type {?} */ c = this._entries.length; i < c; i++) {
            let /** @type {?} */ sp = i;
            while (sp-- > 0) {
                buffer.add('&nbsp;');
            }
            let /** @type {?} */ r = this._entries[i];
            buffer.add('&nbsp;');
            buffer.add(r.srec.key);
            buffer.add('&nbsp;&nbsp;:&nbsp;');
            buffer.add(r.srec.val);
            buffer.add((r.srec.fromChaining ? ' ^' : ''));
            buffer.add((r.maskedByIdx !== 0 ? ' X' : ''));
            buffer.add('<br/>');
        }
        let /** @type {?} */ propertyActivation = this.currentActivation._propertyActivation;
        if (isPresent(propertyActivation)) {
            let /** @type {?} */ srecs = propertyActivation._recs;
            buffer.add('&nbsp;&nbsp;&nbsp;<b>PropertyActivation...</b><br/>');
            for (let /** @type {?} */ i = 0, /** @type {?} */ c = srecs.length; i < c; i++) {
                let /** @type {?} */ sp = i + this._entries.length + 1;
                while (sp-- > 0) {
                    buffer.add('&nbsp;&nbsp;');
                }
                let /** @type {?} */ r = srecs[i];
                buffer.add(r.key);
                buffer.add('&nbsp;&nbsp;:&nbsp;');
                buffer.add(r.val);
                buffer.add((r.fromChaining ? '&nbsp;&nbsp;' : '&nbsp;&nbsp;!'));
                buffer.add('<br/>');
            }
        }
        buffer.add('&nbsp;<br/><b>Props:</b><br/>');
        this.writeProperties(buffer, this.allProperties(), 1, false);
        return buffer.toString();
    }
    /**
     * @return {?}
     */
    _logContext() {
        let /** @type {?} */ debugString = this.debugString();
        print(debugString);
        print('\n');
    }
    /**
     * @param {?} buf
     * @param {?} properties
     * @param {?} level
     * @param {?} singleLine
     * @return {?}
     */
    writeProperties(buf, properties, level, singleLine) {
        MapWrapper.iterable(properties).forEach((value, key) => {
            if (!singleLine) {
                while (level-- > 0) {
                    buf.add('&nbsp;&nbsp;&nbsp;');
                }
            }
            if (isBlank(value)) {
                buf.add(key);
                buf.add(' :null');
                buf.add(singleLine ? ';&nbsp;&nbsp;' : ';<br/>');
            }
            else {
                buf.add('&nbsp;&nbsp;&nbsp;');
                buf.add(key);
                buf.add(':');
                if (isString(value) || isNumber(value)) {
                    buf.add('&nbsp;&nbsp;');
                    buf.add(value);
                    buf.add('&nbsp;&nbsp;');
                }
                else if (isStringMap(value)) {
                    buf.add('{');
                    buf.add(value);
                    buf.add('}');
                }
                else if (value instanceof Expr) {
                    buf.add(value.toString());
                }
                else if (value instanceof Map) {
                    buf.add(MapWrapper.toString(value));
                }
                else if (isArray(value)) {
                    ListWrapper.toString(value);
                }
                else if (value instanceof OverrideValue) {
                    buf.add(value.toString());
                }
                else if (value instanceof FieldPath) {
                    buf.add('$');
                    buf.add(value.toString());
                }
                if (singleLine) {
                    buf.add(';');
                }
                else {
                    buf.add('<br/>');
                }
            }
        });
    }
    /**
     * @return {?}
     */
    lastMatchWithoutContextProps() {
        return ListWrapper.isEmpty(this._entries) ? null : this._entries[this._entries.length - 1].srec.match;
    }
    /**
     * @return {?}
     */
    lastMatch() {
        if (ListWrapper.isEmpty(this._entries)) {
            return null;
        }
        let /** @type {?} */ match = ListWrapper.last(this._entries)
            .propertyLocalMatches(this);
        return (isPresent(match)) ? match : this.lastMatchWithoutContextProps();
    }
    /**
     * @return {?}
     */
    lastStaticRec() {
        if (ListWrapper.isEmpty(this._entries)) {
            return null;
        }
        let /** @type {?} */ rec = ListWrapper.last(this._entries).propertyLocalStaticRec(this);
        return isPresent(rec) ? rec : ListWrapper.last(this._entries).srec;
    }
    /**
     * @return {?}
     */
    get recPool() {
        return this._recPool;
    }
    /**
     * @return {?}
     */
    get currentActivation() {
        return this._currentActivation;
    }
    /**
     * @return {?}
     */
    extendedFields() {
        return this.values;
    }
}
Context._CacheActivations = false;
Context._ExpensiveContextConsistencyChecksEnabled = false;
Context._DebugRuleMatches = false;
Context._Debug_SetsCount = 0;
Context.MaxContextStackSize = 200;
Context.EmptyMap = null;
Context.EmptyRemoveMap = new Map();
/**
 * A sharable/re-applicable block of setScopeKeyAssignment _StaticRecs.  An Activation contains
 * the list of assignment records resulting from (chaining from) a single original
 * assignment (as well as _DeferredAssignment records for dynamic values that cannot
 * be statically resolved to records).  Activations form a shared/cached tree, based
 * on context assignment paths previously traversed via assignments to some Context.
 * Subsequent traversals of these paths (likely by different Context instances)
 * are greatly optimized: an existing Activation is retrieved and its records appended
 * to the context's _entries stack; all of the traditional computation of rule match lookups,
 * chained assignments and override indexes is bypassed.
 * Activation gives special treatment to the 'propertyActivation', i.e. the activation
 * resulting from the application of the 'scopeKey' to the current context.  Property lookup
 * following and context assignment require application of the scopeKey, but then the scope key
 * must immediately be popped for the next context assignment.  To avoid this constant push/pop
 * on the bottom of the stack, _Activations cache a side activation (the propertyActivation)
 * for the result of applying the scopeKey to the current activation.  This stack (and its
 * properties) are cached on the side, and can be accessed without actually modifying the main
 * context stack.
 */
class Activation {
    /**
     * @param {?=} _parent
     */
    constructor(_parent) {
        this._parent = _parent;
        this._recs = new Array();
        this._origEntryCount = 0;
    }
    /**
     * @param {?} contextKey
     * @param {?} value
     * @param {?} chaining
     * @return {?}
     */
    getChildActivation(contextKey, value, chaining) {
        if (isBlank(value)) {
            value = Meta.NullMarker;
        }
        let /** @type {?} */ byKey = (chaining)
            ? this._valueNodeMapByContextKeyChaining :
            this._valueNodeMapByContextKey;
        if (isBlank(byKey)) {
            return null;
        }
        let /** @type {?} */ byVal = byKey.get(contextKey);
        return (isBlank(byVal)) ? null : byVal.getValue(value);
    }
    /**
     * @param {?} contextKey
     * @param {?} value
     * @param {?} activation
     * @param {?} chaining
     * @return {?}
     */
    cacheChildActivation(contextKey, value, activation, chaining) {
        if (isBlank(value)) {
            value = Meta.NullMarker;
        }
        let /** @type {?} */ byKey;
        if (chaining) {
            if (isBlank((byKey = this._valueNodeMapByContextKeyChaining))) {
                byKey = this._valueNodeMapByContextKeyChaining
                    = new Map();
            }
        }
        else {
            if (isBlank((byKey = this._valueNodeMapByContextKey))) {
                byKey = this._valueNodeMapByContextKey
                    = new Map();
            }
        }
        let /** @type {?} */ byVal = byKey.get(contextKey);
        if (isBlank(byVal)) {
            byVal = new Dictionary();
            byKey.set(contextKey, byVal);
        }
        byVal.setValue(value, activation);
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    addDeferredAssignment(key, value) {
        let /** @type {?} */ newDa;
        if (isBlank(this.deferredAssignments)) {
            this.deferredAssignments = new Array();
        }
        else {
            for (let /** @type {?} */ da of this.deferredAssignments) {
                if (da.key === key) {
                    newDa = da;
                    break;
                }
            }
        }
        if (isBlank(newDa)) {
            newDa = new DeferredAssignment();
            newDa.key = key;
            this.deferredAssignments.push(newDa);
        }
        newDa.value = value;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    hasDeferredAssignmentForKey(key) {
        if (isPresent(this.deferredAssignments)) {
            for (let /** @type {?} */ da of this.deferredAssignments) {
                if (da.key === key) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    propertyActivation(context) {
        assert(context.currentActivation === this, 'PropertyActivation sought on non top of stack activation');
        if (isBlank(this._propertyActivation)) {
            this._propertyActivation = context._createNewPropertyContextActivation(this);
            if (isBlank(this._propertyActivation)) {
                this._propertyActivation = this;
            } // this as null marker
        }
        return this._propertyActivation !== this ? this._propertyActivation : null;
    }
    /**
     * @return {?}
     */
    findExistingPropertyActivation() {
        let /** @type {?} */ activation = this;
        while (isPresent(activation)) {
            let /** @type {?} */ propertyActivation = activation._propertyActivation;
            if (isPresent(propertyActivation) && propertyActivation !== activation
                && !(isBlank(propertyActivation._recs) || ListWrapper.isEmpty(propertyActivation._recs))) {
                return propertyActivation;
            }
            activation = activation._parent;
        }
        return null;
    }
    /**
     * @return {?}
     */
    toString() {
        return util.makeString(this);
    }
}
class DeferredAssignment {
}
class AssignmentSnapshot {
}
class Assignment {
    constructor() {
        this.maskedByIdx = 0;
        this._didInitPropContext = false;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    propertyLocalMatches(context) {
        if (!this._didInitPropContext) {
            this.initPropContext(context);
        }
        return isPresent(this._propertyLocalSrec) ? this._propertyLocalSrec.match : null;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    propertyLocalStaticRec(context) {
        if (!this._didInitPropContext) {
            this.initPropContext(context);
        }
        return this._propertyLocalSrec;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    propertyLocalValues(context) {
        if (!this._didInitPropContext) {
            this.initPropContext(context);
        }
        return this._propertyLocalValues;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    initPropContext(context) {
        this._didInitPropContext = true;
        assert(!Context._ExpensiveContextConsistencyChecksEnabled || ListWrapper.last(context._entries) === this, 'initing prop context on record not on top of stack');
        // Todo: base it on whether we've tries yet to process them.
        let /** @type {?} */ propActivation = (this.srec.activation.propertyActivation(context));
        if (isPresent(propActivation)) {
            context._applyPropertyActivation(propActivation, this);
        }
    }
    /**
     * @return {?}
     */
    reset() {
        this.srec = null;
        this.val = null;
        this.maskedByIdx = 0;
        this._didInitPropContext = false;
        this._propertyLocalSrec = null;
        this._propertyLocalValues = null;
    }
}
/**
 * The 'static' (sharable) part of a context value assignment record.
 * Theses are created by the first _Assignment that needs them
 * and then cached for re-application in their _Activation
 *  (which, in turn, is stored in the global activation tree)
 */
class StaticRec {
    constructor() {
        this.salience = 0;
        this.lastAssignmentIdx = 0;
    }
    /**
     * @return {?}
     */
    properties() {
        return (isPresent(this.match)) ? this.match.properties() : Context.EmptyMap;
    }
    /**
     * @return {?}
     */
    get key() {
        return this._key;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set key(value) {
        this._key = value;
    }
    /**
     * @return {?}
     */
    get val() {
        return this._val;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set val(value) {
        this._val = value;
    }
}
class PropertyAccessor {
    /**
     * @param {?} context
     */
    constructor(context) {
        this.context = context;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    get(key) {
        return this.context.propertyForKey(key);
    }
    /**
     * @return {?}
     */
    toString() {
        return MapWrapper.toString(this.context.allProperties());
    }
}
/**
 * Snapshot is the way how to capture a current state of the context and then replay it back so.
 * for cases when we need to run some rule execution outside of the push/pop cycle
 */
class Snapshot {
    /**
     * @param {?} _context
     */
    constructor(_context) {
        this._context = _context;
        this._meta = _context.meta;
        this._origClass = _context.constructor.name;
        this._assignments = _context.activeAssignments();
        this._allAssignments = _context.allAssignments();
        this._isNested = _context.isNested;
    }
    /**
     * @param {?=} shellCopy
     * @return {?}
     */
    hydrate(shellCopy = true) {
        let /** @type {?} */ assignments = (shellCopy) ? this._assignments : this._allAssignments;
        let /** @type {?} */ newContext = this._meta.newContext();
        newContext.push();
        let /** @type {?} */ lastCnxGeneration = 1;
        for (let /** @type {?} */ a of assignments) {
            if (lastCnxGeneration < a.salience) {
                newContext.push();
            }
            newContext.set(a.key, a.value);
        }
        newContext.isNested = this._isNested;
        return newContext;
    }
}
class ObjectMetaContext extends Context {
    /**
     * @param {?} _meta
     * @param {?=} nested
     */
    constructor(_meta, nested = false) {
        super(_meta, nested);
    }
    /**
     * @return {?}
     */
    get value() {
        let /** @type {?} */ obj = this.object;
        if (isBlank(obj)) {
            return null;
        }
        let /** @type {?} */ fieldPath = this.fieldPath();
        return isPresent(fieldPath) ? fieldPath.getFieldValue(obj) : this.propertyForKey('value');
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set value(val) {
        let /** @type {?} */ fieldPath = this.fieldPath();
        if (isPresent(fieldPath)) {
            assert(isPresent(this.object), 'Call to setValue() with no current object');
            fieldPath.setFieldValue(this.object, val);
        }
        else {
            let /** @type {?} */ value = this.allProperties().get(ObjectMeta.KeyValue);
            assert(isDynamicSettable(value), 'Cant set derived property: ' + value);
            let /** @type {?} */ settable = value;
            ((/** @type {?} */ (value))).evaluateSet(this, val);
            settable.evaluateSet(this, val);
        }
    }
    /**
     * @return {?}
     */
    get object() {
        return this.values.get(ObjectMeta.KeyObject);
    }
    /**
     * @return {?}
     */
    get formatters() {
        if (isBlank(this._formatters)) {
            this._formatters = new Map();
        }
        return this._formatters;
    }
    /**
     * @return {?}
     */
    fieldPath() {
        let /** @type {?} */ propMap = /** @type {?} */ (this.allProperties());
        return propMap.fieldPath;
    }
    /**
     * @return {?}
     */
    locale() {
        return ObjectMetaContext.DefaultLocale;
    }
    /**
     * @return {?}
     */
    timezone() {
        return new Date().getTimezoneOffset();
    }
}
ObjectMetaContext.DefaultLocale = 'en';
class UIContext extends ObjectMetaContext {
    /**
     * @param {?} _meta
     * @param {?=} nested
     */
    constructor(_meta, nested = false) {
        super(_meta, nested);
    }
    /**
     * @return {?}
     */
    locale() {
        return super.locale();
    }
    /**
     * @return {?}
     */
    timezone() {
        return super.timezone();
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * A Selector defines a sort of key/value predicate that must be satisfied for a
 * rule to apply.
 */
class Selector {
    /**
     * @param {?} _key
     * @param {?} _value
     * @param {?=} isDecl
     */
    constructor(_key, _value, isDecl = false) {
        this._key = _key;
        this._value = _value;
        this.isDecl = isDecl;
        this._matchArrayIdx = 0;
    }
    /**
     * @param {?} values
     * @return {?}
     */
    static fromMap(values) {
        const /** @type {?} */ result = new Array();
        MapWrapper.iterable(values).forEach((value, key) => {
            result.push(new Selector(key, value, false));
        });
        return result;
    }
    /**
     * @return {?}
     */
    get key() {
        return this._key;
    }
    /**
     * @return {?}
     */
    get value() {
        return this._value;
    }
    /**
     * @param {?} keyData
     * @return {?}
     */
    bindToKeyData(keyData) {
        this._matchArrayIdx = keyData._id;
        this._matchValue = keyData.matchValue(this._value);
    }
    /**
     * @param {?} matchArray
     * @return {?}
     */
    matches(matchArray) {
        // If we haven't been initialized with a matchValue, then we were indexed and don't need to
        // match
        if (isBlank(this._matchValue)) {
            return true;
        }
        const /** @type {?} */ other = matchArray[this._matchArrayIdx];
        return isPresent(other) ? other.matches(this._matchValue) : false;
    }
    /**
     * @return {?}
     */
    toString() {
        const /** @type {?} */ sj = new StringJoiner([]);
        sj.add(this.key);
        sj.add('=');
        sj.add(this._value.toString());
        sj.add('(');
        sj.add(this.isDecl + '');
        sj.add(')');
        sj.add('[ ');
        sj.add(this._matchArrayIdx + ']');
        return sj.toString();
    }
}
/**
 * A Rule defines a map of properties that should apply in the event that a set of Selectors
 * are matched.  Given a rule base (Meta) and a set of asserted values (Context) a list of matching
 * rules can be computed (by matching their selectors against the values) and by successively (in
 * rank / priority order) applying (merging) their property maps a set of effective properties can
 * be computed.
 *
 */
class Rule {
    /**
     * @param {?} _selectors
     * @param {?=} _properties
     * @param {?=} _rank
     * @param {?=} _lineNumber
     */
    constructor(_selectors, _properties, _rank = -1, _lineNumber = -1) {
        this._selectors = _selectors;
        this._properties = _properties;
        this._rank = _rank;
        this._lineNumber = _lineNumber;
        this.keyMatchesMask = 0;
        this.keyIndexedMask = 0;
        this.keyAntiMask = 0;
    }
    /**
     * @param {?} meta
     * @param {?} src
     * @param {?} dest
     * @param {?} declareKey
     * @return {?}
     */
    static merge(meta, src, dest, declareKey) {
        let /** @type {?} */ updatedMask = 0;
        MapWrapper.iterable(src).forEach((value, key) => {
            const /** @type {?} */ propManager = meta.managerForProperty(key);
            const /** @type {?} */ orig = dest.get(key);
            const /** @type {?} */ isDeclare = (isPresent(declareKey) && key === declareKey);
            const /** @type {?} */ newVal = propManager.mergeProperty(key, orig, value, isDeclare);
            if (newVal !== orig) {
                dest.set(key, newVal);
                const /** @type {?} */ keyData = propManager._keyDataToSet;
                if (isPresent(keyData)) {
                    const /** @type {?} */ keymask = shiftLeft(1, keyData._id);
                    if ((keymask & updatedMask) === 0 &&
                        (dest instanceof PropertyMap)) {
                        updatedMask |= keymask;
                        (/** @type {?} */ (dest)).addContextKey(propManager);
                    }
                }
            }
        });
        return updatedMask;
    }
    /**
     * @param {?} matchArray
     * @return {?}
     */
    matches(matchArray) {
        for (let /** @type {?} */ sel of this._selectors) {
            if (!sel.matches(matchArray)) {
                return false;
            }
        }
        return true;
    }
    /**
     * returns context keys modified
     * @param {?} meta
     * @param {?} properties
     * @param {?} declareKey
     * @return {?}
     */
    apply(meta, properties, declareKey) {
        if (this._rank === Number.MIN_VALUE) {
            return 0;
        }
        return Rule.merge(meta, this._properties, properties, declareKey);
    }
    /**
     * @return {?}
     */
    disable() {
        this._rank = Number.MIN_VALUE;
    }
    /**
     * @return {?}
     */
    disabled() {
        return this._rank === Number.MIN_VALUE;
    }
    /**
     * @return {?}
     */
    get lineNumber() {
        return this._lineNumber;
    }
    /**
     * @param {?} lineNumber
     * @return {?}
     */
    set lineNumber(lineNumber) {
        this._lineNumber = lineNumber;
    }
    /**
     * @return {?}
     */
    location() {
        let /** @type {?} */ path = isPresent(this._ruleSet) ? this._ruleSet.filePath : 'Unknow';
        return (this._lineNumber >= 0) ? (new StringJoiner([
            path, ':', this._lineNumber + ''
        ])).toString() : path;
    }
    /**
     * @return {?}
     */
    get selectors() {
        return this._selectors;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set selectors(value) {
        this._selectors = value;
    }
    /**
     * @return {?}
     */
    get properties() {
        return this._properties;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set properties(value) {
        this._properties = value;
    }
    /**
     * @return {?}
     */
    get rank() {
        return this._rank;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set rank(value) {
        this._rank = value;
    }
    /**
     * @return {?}
     */
    get ruleSet() {
        return this._ruleSet;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set ruleSet(value) {
        this._ruleSet = value;
    }
    /**
     * @return {?}
     */
    get id() {
        return this._id;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set id(value) {
        this._id = value;
    }
    /**
     * @return {?}
     */
    isEditable() {
        return (this._ruleSet !== null) && (this._ruleSet.editableStart > 0) &&
            (this._id >= this._ruleSet.editableStart);
    }
    /**
     * @return {?}
     */
    createDecl() {
        /*
                 @field=dyno { value:${ some expr} } becomes
                 declare { field:dyno }
                 field=dyno { field:dyno; value:${ some expr} }
                 */
        // add rule for declaration
        let /** @type {?} */ selectors = this._selectors;
        let /** @type {?} */ declPred = selectors[selectors.length - 1];
        let /** @type {?} */ prePreds = this.convertKeyOverrides(selectors.slice(0, selectors.length - 1));
        if (isBlank(this._properties)) {
            this._properties = new Map();
        }
        for (let /** @type {?} */ p of selectors) {
            if (!(isArray(p.value))) {
                this._properties.set(p.key, p.value);
            }
        }
        // Flag the declaring rule as a property
        this._properties.set(Meta.DeclRule, new RuleWrapper(this));
        // check for override scope
        let /** @type {?} */ hasOverrideScope = false;
        for (let /** @type {?} */ p of prePreds) {
            if (p.key === declPred.key) {
                hasOverrideScope = true;
            }
        }
        // if decl key isn't scoped, then select on no scope
        if (!hasOverrideScope) {
            let /** @type {?} */ overrideKey = Meta.overrideKeyForKey(declPred.key);
            prePreds.unshift(new Selector(overrideKey, Meta.NullMarker));
        }
        // The decl rule...
        prePreds.push(new Selector(Meta.KeyDeclare, declPred.key));
        let /** @type {?} */ m = new Map();
        m.set(declPred.key, declPred.value);
        return new Rule(prePreds, m, 0, -1);
    }
    /**
     *  rewrite any selector of the form "layout=L1, class=c, layout=L2" to
     *  "layout_o=L1 class=c, layout=L2"
     * @param {?} orig
     * @return {?}
     */
    convertKeyOverrides(orig) {
        let /** @type {?} */ result = orig;
        let /** @type {?} */ count = orig.length;
        for (let /** @type {?} */ i = 0; i < count; i++) {
            let /** @type {?} */ p = orig[i];
            // See if overridded by same key later in selector
            for (let /** @type {?} */ j = i + 1; j < count; j++) {
                let /** @type {?} */ pNext = orig[j];
                if (pNext.key === p.key) {
                    // if we're overridden, we drop ours, and replace the next collision
                    // with one with our prefix
                    // make a copy if we haven't already
                    if (result === orig) {
                        result = orig.slice(0, i);
                    }
                    p = new Selector(Meta.overrideKeyForKey(p.key), p.value);
                    break;
                }
            }
            if (result !== orig) {
                result.push(p);
            }
        }
        return result;
    }
    /**
     * @return {?}
     */
    toString() {
        let /** @type {?} */ sj = new StringJoiner(['<Rule [']);
        sj.add(this._rank + '] ');
        if (isBlank(this.selectors)) {
            sj.add('null, null --> null >');
        }
        else {
            sj.add(ListWrapper.toString(this._selectors));
            sj.add(' -> ');
            if (!this._properties) {
                sj.add('[,]' + ' >');
            }
            else {
                if (this._properties.has('declRule')) ;
                sj.add(MapWrapper.toString(this._properties) + ' >');
            }
            sj.add('[ ');
            sj.add(this.keyIndexedMask + ', ');
            sj.add(this.keyAntiMask + ', ');
            sj.add(this.keyMatchesMask + '');
            sj.add(' ]');
        }
        return sj.toString();
    }
    /**
     * @param {?} values
     * @param {?} meta
     * @return {?}
     */
    _checkRule(values, meta) {
        ListWrapper.forEachWithIndex(this.selectors, (p, i) => {
            let /** @type {?} */ contextValue = values.get(p.key);
            let /** @type {?} */ keyData = meta.keyData(p.key);
            if (isPresent(keyData._transformer)) {
                contextValue = keyData._transformer.tranformForMatch(contextValue);
            }
            if (isPresent(contextValue) &&
                ((Meta.KeyAny === p.value && BooleanWrapper.boleanValue(contextValue) ||
                    Meta.objectEquals(contextValue, p.value) ||
                    (isArray(p.value) && p.value.indexOf(contextValue) > -1) ||
                    (isArray(p.value) && contextValue.indexOf(p.value) > -1)))) ;
            else {
                print('Possible bad rule match!  Rule: %s; selector: %s, context val: %s' + this +
                    ' ' + p + ' ' + contextValue);
            }
        });
    }
}
class RuleWrapper {
    /**
     * @param {?} rule
     */
    constructor(rule) {
        this.rule = rule;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Meta is the core class in MetaUI.  An instance of meta represents a 'Rule Base' (a repository
 * rules), and this rule base is used to compute property maps based on a series of key/value
 * constraints (typically based on the current values in a Context instance).
 *
 * Meta works in concert with Match.MatchResult to cache partial matches (match trees) with cached
 * computed property maps. Meta is generally used by way of its subclasses ObjectMeta and UIMeta
 * (which extend Meta with behaviors around auto-creating rules for references Typescripts classes
 * and dynamic properties for field and layout zoning)
 *
 *
 */
class Meta {
    constructor() {
        this._rules = new Array();
        this._ruleCount = 0;
        this._testRules = new Map();
        this._nextKeyId = 0;
        this._ruleSetGeneration = 0;
        this._keyData = new Map();
        this._keyDatasById = new Array(Meta.MaxKeyDatas);
        this._MatchToPropsCache = new Dictionary();
        this._PropertyMapUniquer = new Dictionary();
        this._identityCache = new Dictionary();
        this._managerForProperty = new Map();
        this._declareKeyMask = 0;
        Meta.PropertyMerger_DeclareList = new PropertyMergerDeclareList();
        Meta.PropertyMerger_Traits = new PropertyMergerDeclareListForTrait();
        Meta.PropertyMerger_List = new PropertyMerger_List();
        Meta.Transformer_KeyPresent = new KeyValueTransformer_KeyPresent();
        this._declareKeyMask = this.keyData(Meta.KeyDeclare).maskValue();
        this.registerPropertyMerger(Meta.KeyTrait, Meta.PropertyMerger_Traits);
        let /** @type {?} */ nooprule = new Rule(null, null, 0, 0);
        nooprule.disable();
        this._rules[0] = nooprule;
        this._ruleCount = 1;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    static booleanValue(value) {
        return BooleanWrapper.boleanValue(value);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    static toList(value) {
        return (isArray(value)) ? value : [value];
    }
    /**
     * @param {?} one
     * @param {?} two
     * @return {?}
     */
    static objectEquals(one, two) {
        if (isBlank(one) && isBlank(two)) {
            return true;
        }
        if (isBlank(one) || isBlank(two)) {
            return false;
        }
        return equals(one, two);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    static overrideKeyForKey(key) {
        return key + '_o';
    }
    /**
     * @param {?} traits
     * @param {?} map
     * @return {?}
     */
    static addTraits(traits, map) {
        let /** @type {?} */ current = map.get(Meta.KeyTrait);
        if (isBlank(current)) {
            map.set(Meta.KeyTrait, traits);
        }
        else {
            ListWrapper.addAll(current, traits);
            map.set(Meta.KeyTrait, current);
        }
    }
    /**
     * @param {?} trait
     * @param {?} map
     * @return {?}
     */
    static addTrait(trait, map) {
        let /** @type {?} */ current = map.get(Meta.KeyTrait);
        if (isBlank(current)) {
            map.set(Meta.KeyTrait, Meta.toList(trait));
        }
        else {
            current.push(trait);
            map.set(Meta.KeyTrait, current);
        }
    }
    /**
     * @param {?} object
     * @return {?}
     */
    static className(object) {
        if (isStringMap(object) && (isEntity(object) || isValue(object))) {
            return (/** @type {?} */ (object)).className();
        }
        else if (isStringMap(object)) {
            return objectToName(object);
        }
        else if (isFunction(object)) {
            return object.name;
        }
        return object;
    }
    /**
     * @param {?} loader
     * @return {?}
     */
    registerLoader(loader) {
        this._ruleLoader = loader;
    }
    /**
     * @param {?} rule
     * @return {?}
     */
    addRule(rule) {
        let /** @type {?} */ selectors = rule.selectors;
        if (selectors.length > 0 && selectors[selectors.length - 1].isDecl) {
            let /** @type {?} */ decl = rule.createDecl();
            this._addRule(decl, true);
        }
        // we allow null to enable creation of a decl, but otherwise this rule has no effect
        if (isPresent(rule.properties)) {
            // After we've captured the decl, do the collapse
            rule._selectors = rule.convertKeyOverrides(rule._selectors);
            this._addRule(rule, true);
        }
    }
    /**
     * @param {?} rule
     * @param {?} pos
     * @return {?}
     */
    _addToRules(rule, pos) {
        this._rules[pos] = rule;
    }
    /**
     * @param {?} rule
     * @param {?} checkPropScope
     * @return {?}
     */
    _addRule(rule, checkPropScope) {
        assert(isPresent(this._currentRuleSet), 'Attempt to add rule without current RuleSet');
        let /** @type {?} */ selectors = rule._selectors;
        let /** @type {?} */ entryId = this._currentRuleSet.allocateNextRuleEntry();
        rule.id = entryId;
        if (rule.rank === 0) {
            rule.rank = this._currentRuleSet._rank++;
        }
        rule.ruleSet = this._currentRuleSet;
        this._addToRules(rule, entryId);
        // index it
        let /** @type {?} */ lastScopeKeyData;
        let /** @type {?} */ declKey;
        let /** @type {?} */ declMask = this.declareKeyMask;
        let /** @type {?} */ matchMask = 0, /** @type {?} */ indexedMask = 0, /** @type {?} */ antiMask = 0;
        let /** @type {?} */ count = selectors.length;
        let /** @type {?} */ indexOnlySelector = Meta._UsePartialIndexing ? this.bestSelectorToIndex(selectors) : null;
        for (let /** @type {?} */ i = count - 1; i >= 0; i--) {
            let /** @type {?} */ p = selectors[i];
            let /** @type {?} */ shouldIndex = (indexOnlySelector === null || p === indexOnlySelector);
            let /** @type {?} */ data = this.keyData(p.key);
            let /** @type {?} */ dataMask = data.maskValue();
            if (!this.isNullMarker(p.value)) {
                if (shouldIndex || Meta._DebugDoubleCheckMatches) {
                    if (isArray(p.value)) {
                        for (let /** @type {?} */ v of p.value) {
                            data.addEntry(v, entryId);
                        }
                    }
                    else {
                        data.addEntry(p.value, entryId);
                    }
                    if (shouldIndex) {
                        indexedMask |= shiftLeft(1, data.id);
                    }
                }
                if (!shouldIndex) {
                    // prepare selector for direct evaluation
                    p.bindToKeyData(data);
                }
                matchMask |= dataMask;
                if (data.isPropertyScope && isBlank(lastScopeKeyData)) {
                    lastScopeKeyData = data;
                }
                if ((dataMask & declMask) !== 0) {
                    declKey = p.value;
                }
            }
            else {
                antiMask |= dataMask;
            }
        }
        let /** @type {?} */ isDecl = isPresent(declKey);
        let /** @type {?} */ nonScopeKeyDecl = isPresent(declKey) && !this.keyData(declKey).isPropertyScope;
        if (!isDecl || nonScopeKeyDecl) {
            // all non-decl rules don't apply outside decl context
            if (!isDecl) {
                antiMask |= declMask;
            }
            if (isPresent(lastScopeKeyData) && checkPropScope) {
                let /** @type {?} */ traitVal = rule.properties.get(Meta.KeyTrait);
                if (isPresent(traitVal)) {
                    let /** @type {?} */ traitKey = lastScopeKeyData._key + '_trait';
                    let /** @type {?} */ properties = MapWrapper.createEmpty();
                    properties.set(traitKey, traitVal);
                    let /** @type {?} */ traitRule = new Rule(rule._selectors, properties, rule.rank, rule.lineNumber);
                    this._addRule(traitRule, false);
                }
                rule._selectors = selectors.slice(0);
                let /** @type {?} */ scopeSel = new Selector(Meta.ScopeKey, lastScopeKeyData.key);
                rule.selectors.push(scopeSel);
                let /** @type {?} */ data = this.keyData(Meta.ScopeKey);
                if (!Meta._UsePartialIndexing || Meta._DebugDoubleCheckMatches) {
                    data.addEntry(lastScopeKeyData._key, entryId);
                    indexedMask |= shiftLeft(1, data._id);
                }
                scopeSel.bindToKeyData(data);
                matchMask |= shiftLeft(1, data._id);
            }
        }
        rule.keyMatchesMask = matchMask;
        rule.keyIndexedMask = indexedMask;
        rule.keyAntiMask = antiMask;
    }
    /**
     * @param {?} selectors
     * @return {?}
     */
    bestSelectorToIndex(selectors) {
        let /** @type {?} */ best;
        let /** @type {?} */ bestRank = Number.MIN_VALUE;
        let /** @type {?} */ pos = 0;
        for (let /** @type {?} */ sel of selectors) {
            let /** @type {?} */ rank = this.selectivityRank(sel) + pos++;
            if (rank > bestRank) {
                best = sel;
                bestRank = rank;
            }
        }
        return best;
    }
    /**
     * @param {?} selector
     * @return {?}
     */
    selectivityRank(selector) {
        // Score selectors: good if property scope, key !== '*' or bool
        // '*' is particularly bad, since these are inherited by all others
        let /** @type {?} */ score = 1;
        let /** @type {?} */ value = selector.value;
        if (isPresent(value) && !(Meta.KeyAny === value)) {
            score += (isBoolean(value) ? 1 : 9);
        }
        let /** @type {?} */ keyData = this.keyData(selector.key);
        if (keyData.isPropertyScope) {
            score *= 5;
        }
        // Todo: we could score based on # of entries in KeyData
        return score;
    }
    /**
     * if addition of this rule results in addition of extra rules, those are returned
     * (null otherwise)
     * @return {?}
     */
    _editingRuleEnd() {
        return Math.max(this._currentRuleSet.end, this._ruleCount);
    }
    /**
     * @param {?} rule
     * @return {?}
     */
    _addRuleAndReturnExtras(rule) {
        let /** @type {?} */ start = this._editingRuleEnd();
        let /** @type {?} */ extras;
        this.addRule(rule);
        // Return any extra rules created by addition of this one
        for (let /** @type {?} */ i = start, /** @type {?} */ c = this._editingRuleEnd(); i < c; i++) {
            let /** @type {?} */ r = this._rules[i];
            if (r !== rule) {
                if (isBlank(extras)) {
                    extras = new Array();
                }
                extras.push(r);
            }
        }
        return extras;
    }
    /**
     * @param {?} rule
     * @param {?} extras
     * @return {?}
     */
    _updateEditedRule(rule, extras) {
        // in place replace existing rule with NoOp
        let /** @type {?} */ nooprule = new Rule(null, null, 0, 0);
        nooprule.disable();
        this._rules[rule.id] = nooprule;
        if (isPresent(extras)) {
            for (let /** @type {?} */ r of extras) {
                r.disable();
            }
        }
        // Since this rule has already been mutated (the first time it was added) we need to
        // reverse the addition of the scopeKey
        let /** @type {?} */ preds = rule.selectors;
        if ((isPresent(preds) && preds.length > 0) && ListWrapper.last(preds).key === Meta.ScopeKey) {
            ListWrapper.removeAt(preds, preds.length);
        }
        // now (re)-add it and invalidate
        extras = this._addRuleAndReturnExtras(rule);
        this.invalidateRules();
        return extras;
    }
    /**
     * @param {?} preds
     * @return {?}
     */
    scopeKeyForSelector(preds) {
        for (let /** @type {?} */ i = preds.length - 1; i >= 0; i--) {
            let /** @type {?} */ pred = preds[i];
            let /** @type {?} */ data = this.keyData(pred.key);
            if (data.isPropertyScope) {
                return pred.key;
            }
        }
        return null;
    }
    /**
     * @param {?} selectorMap
     * @param {?} propertyMap
     * @return {?}
     */
    addRuleFromSelectorMap(selectorMap, propertyMap) {
        this.addRuleFromSelectorMapWithRank(selectorMap, propertyMap, 0);
    }
    /**
     * @param {?} selectorMap
     * @param {?} propertyMap
     * @param {?} rank
     * @return {?}
     */
    addRuleFromSelectorMapWithRank(selectorMap, propertyMap, rank) {
        let /** @type {?} */ rule = new Rule(Selector.fromMap(selectorMap), propertyMap, 0, -1);
        if (rank !== 0) {
            rule.rank = rank;
        }
        this.addRule(rule);
    }
    /**
     * @param {?} ruleSet
     * @param {?} selectors
     * @return {?}
     */
    addRules(ruleSet, selectors) {
        // Special keys:  'props, 'rules'.  Everthing else is a selector
        let /** @type {?} */ props;
        let /** @type {?} */ rules;
        MapWrapper.iterable(ruleSet).forEach((value, key) => {
            if (key === 'props') {
                props = value;
            }
            else if (key === 'rules') {
                rules = value;
            }
            else {
                selectors.push(new Selector(key, value));
            }
        });
        if (isPresent(props)) {
            this.addRule(new Rule(selectors, props, 0));
        }
        if (isPresent(rules)) {
            for (let /** @type {?} */ r of rules) {
                this.addRules(r, selectors);
            }
        }
    }
    /**
     * @param {?=} ruleText
     * @param {?=} module
     * @param {?=} editable
     * @return {?}
     */
    _loadRules(ruleText, module = 'system', editable = true) {
        try {
            if (isPresent(this._ruleLoader)) {
                this._ruleLoader.loadRules(this, ruleText, module, (rule) => this.addRule(rule));
            }
        }
        catch (/** @type {?} */ e) {
            this.endRuleSet().disableRules();
            throw new Error('Error loading rule: ' + e);
        }
    }
    /**
     * @param {?=} ruleText
     * @return {?}
     */
    loadRules(ruleText) {
        this._loadRulesWithRuleSet('StringLiteral', ruleText, 0);
        this.endRuleSet();
    }
    /**
     * @param {?} filename
     * @param {?} ruleText
     * @param {?} rank
     * @return {?}
     */
    _loadRulesWithRuleSet(filename, ruleText, rank) {
        this.beginRuleSetWithRank(rank, filename);
        try {
            this._loadRules(ruleText);
        }
        catch (/** @type {?} */ e) {
            this.endRuleSet().disableRules();
            throw new Error('Error loading rule: ' + e);
        }
    }
    /**
     * @param {?} source
     * @param {?} userClass
     * @return {?}
     */
    loadUserRule(source, userClass) {
        return unimplemented();
    }
    /**
     * @param {?} propString
     * @param {?} propertyMap
     * @return {?}
     */
    parsePropertyAssignment(propString, propertyMap) {
        // todo: implement this
        return unimplemented();
    }
    /**
     * @return {?}
     */
    clearCaches() {
        this._MatchToPropsCache = new Dictionary();
        this._PropertyMapUniquer = new Dictionary();
        this._identityCache = new Dictionary();
    }
    /**
     * @param {?} rule
     * @return {?}
     */
    isTraitExportRule(rule) {
        if (isBlank(rule.properties) || rule || rule.properties.size === 1) {
            let /** @type {?} */ key = Array.from(rule.properties.keys())[0];
            return StringWrapper.endsWidth(key, '_trait');
        }
        return false;
    }
    /**
     * @param {?} identificator
     * @return {?}
     */
    beginRuleSet(identificator) {
        this.beginRuleSetWithRank(this._ruleCount, identificator);
    }
    /**
     * @param {?} rank
     * @param {?} filePath
     * @return {?}
     */
    beginRuleSetWithRank(rank, filePath) {
        try {
            assert(isBlank(this._currentRuleSet), 'Can t start new rule set while one in progress');
            this._currentRuleSet = new RuleSet(this);
            this._currentRuleSet._start = this._ruleCount;
            this._currentRuleSet._end = this._ruleCount;
            this._currentRuleSet._rank = rank;
            this._currentRuleSet._filePath = filePath;
        }
        catch (/** @type {?} */ e) {
            throw e;
        }
    }
    /**
     * @param {?} orig
     * @return {?}
     */
    beginReplacementRuleSet(orig) {
        let /** @type {?} */ origRank = orig.startRank();
        this.beginRuleSetWithRank(this._ruleCount, orig._filePath);
        this._currentRuleSet._rank = origRank;
    }
    /**
     * @return {?}
     */
    endRuleSet() {
        assert(isPresent(this._currentRuleSet), 'No rule set progress');
        let /** @type {?} */ result = this._currentRuleSet;
        if (this._ruleCount < result._end) {
            this._ruleCount = result._end;
        }
        this._currentRuleSet = null;
        this._ruleSetGeneration++;
        return result;
    }
    /**
     * @return {?}
     */
    get ruleSetGeneration() {
        return this._ruleSetGeneration;
    }
    /**
     * @return {?}
     */
    invalidateRules() {
        this._ruleSetGeneration++;
        this.clearCaches();
    }
    /**
     * @return {?}
     */
    newContext() {
        return new Context(this);
    }
    /**
     * @return {?}
     */
    get declareKeyMask() {
        return this._declareKeyMask;
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    touch(key, value) {
        let /** @type {?} */ context = this.newContext();
        context.push();
        context.set(key, value);
        context.allProperties();
        context.pop();
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    transformValue(key, value) {
        let /** @type {?} */ keyData = this._keyData.get(key);
        if (isPresent(keyData) && isPresent(keyData._transformer)) {
            value = keyData._transformer.tranformForMatch(value);
        }
        return value;
    }
    /**
     * @param {?} key
     * @param {?} value
     * @param {?} intermediateResult
     * @return {?}
     */
    match(key, value, intermediateResult) {
        let /** @type {?} */ keyData = this._keyData.get(key);
        if (isBlank(keyData)) {
            return intermediateResult;
        }
        let /** @type {?} */ keyMask = shiftLeft(1, keyData._id);
        // Does our result already include this key?  Then no need to join again
        // if (intermediateResult !== null && (intermediateResult._keysMatchedMask & keyMask) !==
        // 0) return intermediateResult;
        return new MatchResult(this, keyData, value, intermediateResult);
    }
    /**
     * @param {?} key
     * @param {?} value
     * @param {?} intermediateResult
     * @return {?}
     */
    unionOverrideMatch(key, value, intermediateResult) {
        let /** @type {?} */ keyData = this._keyData.get(Meta.overrideKeyForKey(key));
        if (isBlank(keyData)) {
            return intermediateResult;
        }
        return new UnionMatchResult(this, keyData, value, intermediateResult);
    }
    /**
     * @return {?}
     */
    newPropertiesMap() {
        return new PropertyMap();
    }
    /**
     * @param {?} matchResult
     * @return {?}
     */
    propertiesForMatch(matchResult) {
        let /** @type {?} */ properties = this._MatchToPropsCache.getValue(matchResult);
        if (isPresent(properties)) {
            return properties;
        }
        properties = this.newPropertiesMap();
        let /** @type {?} */ arr = matchResult.filteredMatches();
        if (isBlank(arr)) {
            return properties;
        }
        // first entry is count
        let /** @type {?} */ count = arr[0];
        let /** @type {?} */ rules = new Array(count);
        for (let /** @type {?} */ i = 0; i < count; i++) {
            rules[i] = this._rules[arr[i + 1]];
        }
        ListWrapper.sort(rules, (o1, o2) => o1.rank - o2.rank);
        let /** @type {?} */ modifiedMask = 0;
        let /** @type {?} */ declareKey = ((this._declareKeyMask & matchResult.keysMatchedMask) !== 0)
            ? matchResult.valueForKey(Meta.KeyDeclare) : null;
        for (let /** @type {?} */ r in rules) {
            modifiedMask |= rules[r].apply(this, properties, declareKey);
        }
        properties.awakeProperties();
        this._MatchToPropsCache.setValue(matchResult.immutableCopy(), properties);
        return properties;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    keyData(key) {
        let /** @type {?} */ data = this._keyData.get(key);
        if (isBlank(data)) {
            let /** @type {?} */ id = this._nextKeyId;
            if (id >= Meta.MaxKeyDatas - 1) {
                print('Exceeded maximum number of context keys');
            }
            this._nextKeyId++;
            data = new KeyData(key, id);
            this._keyDatasById[id] = data;
            this._keyData.set(key, data);
        }
        return data;
    }
    /**
     * @param {?} mask
     * @return {?}
     */
    _keysInMask(mask) {
        let /** @type {?} */ matches = [];
        let /** @type {?} */ pos = 0;
        while (mask !== 0) {
            if ((mask & 1) !== 0) {
                matches.push(this._keyDatasById[pos]._key);
            }
            pos++;
            mask = shiftRight(mask, 1);
        }
        return matches;
    }
    /**
     * @param {?} key
     * @param {?} o
     * @return {?}
     */
    registerKeyInitObserver(key, o) {
        this.keyData(key).addObserver(o);
    }
    /**
     * @param {?} key
     * @param {?} transformer
     * @return {?}
     */
    registerValueTransformerForKey(key, transformer) {
        this.keyData(key)._transformer = transformer;
    }
    /**
     * @return {?}
     */
    get identityCache() {
        return this._identityCache;
    }
    /**
     * @return {?}
     */
    newMatchArray() {
        return [];
    }
    /**
     * @param {?} array
     * @param {?} keyData
     * @param {?} matchValue
     * @return {?}
     */
    matchArrayAssign(array, keyData, matchValue) {
        let /** @type {?} */ idx = keyData._id;
        let /** @type {?} */ curr = array[idx];
        if (isPresent(curr)) {
            matchValue = curr.updateByAdding(matchValue);
        }
        array[idx] = matchValue;
    }
    /**
     * @param {?} propertyName
     * @param {?} origValue
     * @return {?}
     */
    propertyWillDoMerge(propertyName, origValue) {
        let /** @type {?} */ merger = this.mergerForProperty(propertyName);
        return this.isPropertyMergerIsChaining(merger) || (isPresent(origValue) && (origValue instanceof Map));
    }
    /**
     * @param {?} name
     * @return {?}
     */
    managerForProperty(name) {
        let /** @type {?} */ manager = this._managerForProperty.get(name);
        if (isBlank(manager)) {
            manager = new PropertyManager(name);
            this._managerForProperty.set(name, manager);
        }
        return manager;
    }
    /**
     * @param {?} propertyName
     * @param {?} contextKey
     * @return {?}
     */
    mirrorPropertyToContext(propertyName, contextKey) {
        let /** @type {?} */ keyData = this.keyData(contextKey);
        let /** @type {?} */ manager = this.managerForProperty(propertyName);
        manager._keyDataToSet = keyData;
    }
    /**
     * @param {?} contextKey
     * @return {?}
     */
    defineKeyAsPropertyScope(contextKey) {
        let /** @type {?} */ keyData = this.keyData(contextKey);
        keyData.isPropertyScope = true;
        let /** @type {?} */ traitKey = contextKey + '_trait';
        this.mirrorPropertyToContext(traitKey, traitKey);
        this.registerPropertyMerger(traitKey, Meta.PropertyMerger_DeclareList);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    isPropertyScopeKey(key) {
        return Meta.ScopeKey === key;
    }
    /**
     * @param {?} propertyName
     * @param {?} merger
     * @return {?}
     */
    registerPropertyMerger(propertyName, merger) {
        if (isBlank(merger._meta)) {
            merger._meta = this;
        }
        let /** @type {?} */ manager = this.managerForProperty(propertyName);
        manager._merger = merger;
    }
    /**
     * @param {?} propertyName
     * @return {?}
     */
    mergerForProperty(propertyName) {
        let /** @type {?} */ manager = this.managerForProperty(propertyName);
        return manager._merger;
    }
    /**
     * @param {?} val
     * @return {?}
     */
    isPropertyMergerIsChaining(val) {
        return isPresent(val.isPropMergerIsChainingMark) && val.isPropMergerIsChainingMark;
    }
    /**
     * @param {?} trait
     * @return {?}
     */
    groupForTrait(trait) {
        return 'default';
    }
    /**
     * @return {?}
     */
    _logRuleStats() {
        let /** @type {?} */ total = 0;
        let /** @type {?} */ values = this._keyData.keys();
        let /** @type {?} */ counts = [];
        for (const /** @type {?} */ id of Array.from(values)) {
            let /** @type {?} */ keyData = this._keyData.get(id);
            let /** @type {?} */ valuess = keyData.ruleVecs.values();
            for (let /** @type {?} */ vm of valuess) {
                let /** @type {?} */ kvc = new KeyValueCount(keyData._key, (/** @type {?} */ (vm))['_value'], isPresent(vm._arr) ? vm._arr[0] : 0);
                total += kvc.count;
                counts.push(kvc);
            }
        }
        ListWrapper.sort(counts, (o1, o2) => o2.count - o1.count);
        let /** @type {?} */ buf = new StringJoiner([]);
        let /** @type {?} */ c = Math.min(10, counts.length);
        buf.add('Total index entries comparisons performed: ' + Match._Debug_ElementProcessCount);
        buf.add('\nTotal index entries: ' + total);
        buf.add('\nTop  keys/values: ' + c);
        for (let /** @type {?} */ i = 0; i < c; i++) {
            let /** @type {?} */ kvc = counts[i];
            buf.add('     ' + kvc.key + '  = ' + kvc.value + ' : ' + kvc.count + ' entries');
            buf.add('\n');
        }
        print(buf.toString());
    }
    /**
     * @return {?}
     */
    toString() {
        return 'Meta';
    }
    /**
     * @param {?} value
     * @return {?}
     */
    isNullMarker(value) {
        return isPresent(value) && value['markernull'];
    }
    /**
     * @param {?} testRuleName
     * @param {?} source
     * @return {?}
     */
    addTestUserRule(testRuleName, source) {
        this._testRules.set(testRuleName, source);
    }
}
Meta.KeyAny = '*';
Meta.KeyDeclare = 'declare';
Meta.KeyTrait = 'trait';
Meta.LowRulePriority = -100000;
Meta.SystemRulePriority = -200000;
Meta.ClassRulePriority = -100000;
Meta.TemplateRulePriority = 100000;
Meta.EditorRulePriority = 200000;
Meta.MaxKeyDatas = 64;
Meta.NullMarker = { markernull: true };
Meta.ScopeKey = 'scopeKey';
Meta.DeclRule = 'declRule';
/**
 *
 * PartialIndexing indexes each rule by a single (well chosen) key and evaluates other parts of
 * the selector on the index-filtered matches (generally this is a  win since may selectors are
 * not selective, resulting in huge rule vectors)
 *
 */
Meta._UsePartialIndexing = true;
Meta._DebugDoubleCheckMatches = false;
Meta.PropertyMerger_DeclareList = null;
Meta.PropertyMerger_Traits = null;
Meta.PropertyMerger_List = null;
Meta.Transformer_KeyPresent = null;
class KeyValueCount {
    /**
     * @param {?} key
     * @param {?} value
     * @param {?} count
     */
    constructor(key, value, count) {
        this.key = key;
        this.value = value;
        this.count = count;
    }
}
/**
 * Store of policy information for particular properties -- most significantly, how
 * successive values of this property are to be *merged* during rule application.
 * (See Meta.registerPropertyMerger).  E.g. 'visible', 'trait', and 'valid' all have unique
 * merge policies.
 */
class PropertyManager {
    /**
     * @param {?} _name
     */
    constructor(_name) {
        this._name = _name;
    }
    /**
     * @param {?} propertyName
     * @param {?} orig
     * @param {?} newValue
     * @param {?} isDeclare
     * @return {?}
     */
    mergeProperty(propertyName, orig, newValue, isDeclare) {
        if (isBlank(orig)) {
            return newValue;
        }
        if (newValue instanceof OverrideValue) {
            return (/** @type {?} */ (newValue)).value();
        }
        if (isBlank(this._merger)) {
            // Perhaps should have a data-type-based merger registry?
            if (orig instanceof Map) {
                if (isPresent(newValue) && newValue instanceof Map) {
                    // merge maps
                    // todo: TEST check outcome of the merge and compare
                    let /** @type {?} */ origClone = MapWrapper.clone(orig);
                    newValue = MapWrapper.mergeMapIntoMapWithObject(origClone, newValue, true);
                }
            }
            return newValue;
        }
        if (!(this._merger instanceof PropertyMergerDynamic) &&
            (orig instanceof DynamicPropertyValue || newValue instanceof DynamicPropertyValue)) {
            return new DeferredOperationChain(this._merger, orig, newValue);
        }
        return this._merger.merge(orig, newValue, isDeclare);
    }
}
/**
 * Wrapper for a value that should, in rule application, override any previous value for its
 * property.  This can be used to override default property value merge policy, for instance
 * allowing the 'visible' property to be forced from false to true.
 */
class OverrideValue {
    /**
     * @param {?} _value
     */
    constructor(_value) {
        this._value = _value;
    }
    /**
     * @return {?}
     */
    value() {
        return this._value === 'null' ? null : this._value;
    }
    /**
     * @return {?}
     */
    toString() {
        return isPresent(this._value) ? this._value.toString() + '!' : 'null' + '!';
    }
}
/**
 * KeyData is the primary structure for representing information about context keys
 * (e.g. 'class', 'layout', 'operation', 'field', ...), including an index of rules
 * that match on particular values of that key (_ValueMatches).
 *
 * Note that every context key has a small integer ID (0-63) and these are uses in
 * (long) masks for certain rule matching operations.
 */
class KeyData {
    /**
     * @param {?} _key
     * @param {?} _id
     */
    constructor(_key, _id) {
        this._key = _key;
        this._id = _id;
        this._isPropertyScope = false;
        this._ruleVecs = new Dictionary();
        this._any = this.get(Meta.KeyAny);
    }
    /**
     * @return {?}
     */
    maskValue() {
        return shiftLeft(1, this._id);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    get(value) {
        if (isBlank(value)) {
            value = Meta.NullMarker;
        }
        else if (isPresent(this._transformer)) {
            value = this._transformer.tranformForMatch(value);
        }
        let /** @type {?} */ matches = this._ruleVecs.getValue(value);
        if (isBlank(matches)) {
            matches = new ValueMatches(value);
            if (isPresent(value) && !BooleanWrapper.isFalse(value)) {
                matches._parent = this._any;
            }
            this._ruleVecs.setValue(value, matches);
        }
        return matches;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    matchValue(value) {
        if (isArray(value)) {
            let /** @type {?} */ list = value;
            if (list.length === 1) {
                return this.get(list[0]);
            }
            let /** @type {?} */ multi = new MultiMatchValue();
            ListWrapper.forEachWithIndex(list, (v, i) => {
                multi.data.push(this.get(v));
            });
            return multi;
        }
        else {
            return this.get(value);
        }
    }
    /**
     * @param {?} value
     * @param {?} id
     * @return {?}
     */
    addEntry(value, id) {
        let /** @type {?} */ matches = this.get(value);
        let /** @type {?} */ before = matches._arr;
        let /** @type {?} */ after = Match.addInt(before, id);
        if (before !== after) {
            matches._arr = after;
        }
    }
    /**
     * @param {?} owner
     * @param {?} value
     * @return {?}
     */
    lookup(owner, value) {
        let /** @type {?} */ matches = this.get(value);
        if (!matches._read && isPresent(this._observers)) {
            try {
                if (!matches._read) {
                    // notify
                    if (isPresent(value)) {
                        ListWrapper.forEachWithIndex(this._observers, (v, i) => {
                            v.notify(owner, this._key, value);
                        });
                    }
                }
                matches._read = true;
            }
            finally {
            }
        }
        // check if parent has changed and need to union in parent data
        matches.checkParent();
        return matches._arr;
    }
    /**
     * @param {?} value
     * @param {?} parentValue
     * @return {?}
     */
    setParent(value, parentValue) {
        let /** @type {?} */ parent = this.get(parentValue);
        let /** @type {?} */ child = this.get(value);
        child._parent = parent;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    parent(value) {
        let /** @type {?} */ child = this.get(value);
        return child._parent._value;
    }
    /**
     * @param {?} o
     * @return {?}
     */
    addObserver(o) {
        if (isBlank(this._observers)) {
            this._observers = new Array();
        }
        this._observers.push(o);
    }
    /**
     * @return {?}
     */
    get isPropertyScope() {
        return this._isPropertyScope;
    }
    /**
     * @param {?} yn
     * @return {?}
     */
    set isPropertyScope(yn) {
        this._isPropertyScope = yn;
    }
    /**
     * @return {?}
     */
    get ruleVecs() {
        return this._ruleVecs;
    }
    /**
     * @return {?}
     */
    get key() {
        return this._key;
    }
    /**
     * @return {?}
     */
    get id() {
        return this._id;
    }
    /**
     * @return {?}
     */
    get observers() {
        return this._observers;
    }
}
/**
 * Store of policy information for particular properties -- most significantly, how
 * successive values of this property are to be *merged* during rule application.
 * (See Meta.registerPropertyMerger).  E.g. 'visible', 'trait', and 'valid' all have unique
 * merge policies.
 */
class PropertyMap {
    /**
     * @param {?=} entries
     */
    constructor(entries) {
        if (isPresent(entries)) {
            this._map = new Map(entries);
        }
        else {
            this._map = new Map();
        }
    }
    /**
     * @param {?} key
     * @return {?}
     */
    get(key) {
        return this._map.get(key);
    }
    /**
     * @return {?}
     */
    keys() {
        return this._map.keys();
    }
    /**
     * @return {?}
     */
    values() {
        return this._map.values();
    }
    /**
     * @return {?}
     */
    clear() {
        this._map.clear();
    }
    /**
     * @param {?} key
     * @param {?=} value
     * @return {?}
     */
    set(key, value) {
        return this._map.set(key, value);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    delete(key) {
        return this._map.delete(key);
    }
    /**
     * @param {?} callbackfn
     * @param {?=} thisArg
     * @return {?}
     */
    forEach(callbackfn, thisArg) {
        this._map.forEach(callbackfn);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    has(key) {
        return this._map.has(key);
    }
    /**
     * @return {?}
     */
    [Symbol.iterator]() {
        return this._map[Symbol.iterator]();
    }
    /**
     * @return {?}
     */
    entries() {
        return this._map.entries();
    }
    /**
     * @return {?}
     */
    get size() {
        return this._map.size;
    }
    /**
     * @return {?}
     */
    awakeProperties() {
        MapWrapper.iterable(this).forEach((value, key) => {
            if (isPropertyMapAwaking(value)) {
                let /** @type {?} */ newValue = value.awakeForPropertyMap(this);
                if (newValue !== value) {
                    this.set(key, newValue);
                }
            }
        });
    }
    /**
     * @param {?} key
     * @return {?}
     */
    addContextKey(key) {
        if (isBlank(this._contextPropertiesUpdated)) {
            this._contextPropertiesUpdated = new Array();
        }
        this._contextPropertiesUpdated.push(key);
    }
    /**
     * @return {?}
     */
    get contextKeysUpdated() {
        return this._contextPropertiesUpdated;
    }
    /**
     * @return {?}
     */
    toString() {
        // todo: find better way for the string. thsi is also used as key for the dictionary
        // not really efficient
        let /** @type {?} */ sj = new StringJoiner(['PropertyMap:']);
        sj.add(this.size + ',');
        MapWrapper.iterable(this).forEach((value, key) => {
            if (isPropertyMapAwaking(value)) {
                let /** @type {?} */ newValue = value.awakeForPropertyMap(this);
                if (newValue !== value) {
                    sj.add(key + ':' + value);
                    sj.add(', ');
                }
            }
        });
        return sj.toString();
    }
}
/**
 * @abstract
 */
class PropertyMergerDynamic {
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        return unimplemented();
    }
    /**
     * @return {?}
     */
    toString() {
        return 'PropertyMergerDynamic';
    }
}
class PropertyMerger_Overwrite {
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        return override;
    }
    /**
     * @return {?}
     */
    toString() {
        return 'OVERWRITE';
    }
}
/**
 * PropertyMerger for properties the should be unioned as lists
 */
class PropertyMerger_List {
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        if (!(isArray(orig)) && !(isArray(override)) && Meta.objectEquals(orig, override)) {
            return orig;
        }
        let /** @type {?} */ l1 = Meta.toList(orig);
        let /** @type {?} */ l2 = Meta.toList(override);
        let /** @type {?} */ result = ListWrapper.clone(l1);
        ListWrapper.addElementsIfAbsent(result, l2);
        return result;
    }
}
/**
 * PropertyMerger for properties the should override normally, but return lists when
 * in declare mode (e.g. 'class', 'field', 'layout', ...)
 */
class PropertyMergerDeclareList extends PropertyMergerDynamic {
    constructor() {
        super();
    }
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        if (!isDeclare) {
            return override;
        }
        if (!(isArray(orig)) && !(isArray(override)) && Meta.objectEquals(orig, override)) {
            return orig;
        }
        let /** @type {?} */ result = [];
        ListWrapper.addElementsIfAbsent(result, Meta.toList(orig));
        ListWrapper.addElementsIfAbsent(result, Meta.toList(override));
        return result;
    }
    /**
     * @return {?}
     */
    toString() {
        return 'PropertyMergerDeclareList';
    }
}
/**
 * PropertyMerger for the 'trait' property.  Generally, traits are unioned, except for traits
 * from the same 'traitGroup', which override (i.e. only one trait from each traitGroup should
 * survive).
 */
class PropertyMergerDeclareListForTrait extends PropertyMergerDeclareList {
    constructor() {
        super();
    }
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        if (isDeclare) {
            return super.merge(orig, override, isDeclare);
        }
        // if we're override a single element with itself, don't go List...
        if (!isArray(orig) && !isArray(override) && Meta.objectEquals(orig, override)) {
            return orig;
        }
        let /** @type {?} */ origL = Meta.toList(orig);
        let /** @type {?} */ overrideL = Meta.toList(override);
        let /** @type {?} */ result = [];
        for (let /** @type {?} */ trait of origL) {
            if (trait instanceof OverrideValue) {
                trait = (/** @type {?} */ (trait)).value();
            }
            let /** @type {?} */ canAdd = true;
            let /** @type {?} */ group = this._meta.groupForTrait(trait);
            if (isPresent(group)) {
                for (let /** @type {?} */ overrideTrait of overrideL) {
                    if (overrideTrait instanceof OverrideValue) {
                        overrideTrait = (/** @type {?} */ (overrideTrait)).value();
                    }
                    if (group === this._meta.groupForTrait(overrideTrait)) {
                        canAdd = false;
                        break;
                    }
                }
            }
            if (canAdd) {
                result.push(trait);
            }
        }
        ListWrapper.addElementsIfAbsent(result, overrideL);
        return result;
    }
    /**
     * @return {?}
     */
    toString() {
        return 'PropertyMergerDeclareListForTrait';
    }
}
/**
 * PropertyMerger implementing AND semantics -- i.e. false trumps true.
 * (Used, for instance, for the properties 'visible' and 'editable')
 */
class PropertyMerger_And extends PropertyMergerDynamic {
    constructor() {
        super(...arguments);
        this.isPropMergerIsChainingMark = true;
    }
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        // null will reset (so that it can be overridden to true subsequently
        if (isBlank(override)) {
            return null;
        }
        // If we can evaluate statically, do it now
        if ((isBoolean(orig) && !(BooleanWrapper.boleanValue(orig))) ||
            (isBoolean(override) && !(BooleanWrapper.boleanValue(override)))) {
            return false;
        }
        // ANDing with true is a noop -- return new value
        if (isBoolean(orig) && BooleanWrapper.boleanValue(orig)) {
            return (override instanceof DynamicPropertyValue) ? override
                : BooleanWrapper.boleanValue(override);
        }
        if (isBoolean(override) && BooleanWrapper.boleanValue(override)) {
            return (orig instanceof DynamicPropertyValue) ? orig : BooleanWrapper.boleanValue(override);
        }
        // if one of our values is dynamic, defer
        if ((orig instanceof DynamicPropertyValue || override instanceof DynamicPropertyValue)) {
            return new DeferredOperationChain(this, orig, override);
        }
        return BooleanWrapper.boleanValue(orig) && BooleanWrapper.boleanValue(override);
    }
    /**
     * @return {?}
     */
    toString() {
        return 'AND';
    }
}
class PropertyMerger_Valid {
    constructor() {
        this.isPropMergerIsChainingMark = true;
    }
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        /**
                 *
                 *
                 return (isString(override) || ( isBoolean(override) &&
                 !(BooleanWrapper.boleanValue(override)))) ? override : orig;
                 */
        // if first is error (error message or false, it wins), otherwise second
        return (isString(override) || (isBoolean(override) && BooleanWrapper.isFalse(override)))
            ? override : orig;
    }
    /**
     * @return {?}
     */
    toString() {
        return 'VALIDATE';
    }
}
/**
 * A group of rules originating from a common source.
 * All rules must be added to the rule base as part of a RuleSet.
 */
class RuleSet {
    /**
     * @param {?} _meta
     */
    constructor(_meta) {
        this._meta = _meta;
        this._start = 0;
        this._end = 0;
        this._editableStart = -1;
        this._rank = 0;
    }
    /**
     * @return {?}
     */
    disableRules() {
        for (let /** @type {?} */ i = this._start; i < this._end; i++) {
            this._meta._rules[i].disable();
        }
        this._meta.clearCaches();
    }
    /**
     * @return {?}
     */
    get filePath() {
        return this._filePath;
    }
    /**
     * @param {?} editableOnly
     * @return {?}
     */
    rules(editableOnly) {
        let /** @type {?} */ result = [];
        let /** @type {?} */ i = (editableOnly) ? (this._editableStart === -1 ? this._end : this._editableStart)
            : this._start;
        for (; i < this._end; i++) {
            let /** @type {?} */ r = this._meta._rules[i];
            if (!r.disabled() && !this._meta.isTraitExportRule(r)) {
                result.push(r);
            }
        }
        return result;
    }
    /**
     * @return {?}
     */
    startRank() {
        return (this._start < this._meta._ruleCount)
            ? this._meta._rules[this._start].rank
            : this._rank - (this._end - this._start);
    }
    /**
     * @return {?}
     */
    allocateNextRuleEntry() {
        return (this._meta._ruleCount > this._end) ? this._meta._ruleCount++ : this._end++;
    }
    /**
     * @return {?}
     */
    get start() {
        return this._start;
    }
    /**
     * @return {?}
     */
    get end() {
        return this._end;
    }
    /**
     * @return {?}
     */
    get editableStart() {
        return this._editableStart;
    }
}
/**
 *
 * Uniquely represents a particular key/value in the Meta scope, and indexes all rules
 * with (indexed) Selectors matching that key/value.
 * ValueMatches also models *inheritance* by allowing one key/value to have another
 * as its 'parent' and thereby match on any Selector (and rule) that its parent would.
 *
 * For instance, this enables a rule on class=Number to apply to class=Integer and
 * class=BigDecimal, and one on class=* to apply to any.
 *
 * The utility of 'parent' is not limited, of course, to the key 'class': all keys
 * take advantage of the parent '*' to support unqualified matches on that key, and
 * keys like 'operation' define a value hierarchy ( 'inspect' -> {'view', 'search'},
 * 'search' -> {'keywordSearch', 'textSearch'})
 */
class ValueMatches {
    /**
     * @param {?} value
     */
    constructor(value) {
        this._read = false;
        this._parentSize = 0;
        this._value = value;
    }
    /**
     * @return {?}
     */
    checkParent() {
        // todo: performance: keep a rule set version # and only do this when the rule set has
        // reloaded
        if (isPresent(this._parent)) {
            this._parent.checkParent();
            let /** @type {?} */ parentArr = this._parent._arr;
            if (isPresent(parentArr) && parentArr[0] !== this._parentSize) {
                this._arr = Match.union(this._arr, parentArr);
                this._parentSize = parentArr[0];
            }
        }
    }
    /**
     * @param {?} other
     * @return {?}
     */
    matches(other) {
        if (!(other instanceof ValueMatches)) {
            return other.matches(this);
        }
        // we recurse up parent chain to do superclass matches
        return (other === this) || (isPresent(this._parent) && this._parent.matches(other));
    }
    /**
     * @param {?} other
     * @return {?}
     */
    updateByAdding(other) {
        let /** @type {?} */ multi = new MultiMatchValue();
        multi.data.push(this);
        return multi.updateByAdding(other);
    }
}
class MultiMatchValue {
    constructor() {
        this.data = [];
    }
    /**
     * @param {?} other
     * @return {?}
     */
    matches(other) {
        if (other instanceof MultiMatchValue) {
            // list / list comparison: any combo can match
            for (let /** @type {?} */ i = 0; i < this.data.length; i++) {
                if (other.matches(this.data[i])) {
                    return true;
                }
            }
        }
        else {
            // single value against array: one must match
            for (let /** @type {?} */ i = 0; i < this.data.length; i++) {
                if (this.data[i].matches(other)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {?} other
     * @return {?}
     */
    updateByAdding(other) {
        if (other instanceof MultiMatchValue) {
            let /** @type {?} */ matchValue = /** @type {?} */ (other);
            ListWrapper.addAll(this.data, matchValue.data);
        }
        else {
            this.data.push(other);
        }
        return this;
    }
}
class KeyValueTransformer_KeyPresent {
    /**
     * @param {?} o
     * @return {?}
     */
    tranformForMatch(o) {
        return (isPresent(o) && !(BooleanWrapper.isFalse(o))) ? true : false;
    }
}
/**
 * @param {?} arg
 * @return {?}
 */
function isPropertyMapAwaking(arg) {
    return isPresent(arg) && isPresent(arg.propertyAwaking);
}

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
 * Based on original work: MetaUI: Craig Federighi (2008)
 *
 */
class ItemProperties {
    /**
     * @param {?} name
     * @param {?} properties
     * @param {?} hidden
     */
    constructor(name, properties, hidden) {
        this.name = name;
        this.properties = properties;
        this.hidden = hidden;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * ObjectMeta is resposible for setting up everything related to class, field, actions
 *
 */
class ObjectMeta extends Meta {
    constructor() {
        super();
        this._traitToGroupGeneration = -1;
        this.registerKeyInitObserver(ObjectMeta.KeyClass, new IntrospectionMetaProvider());
        this.registerKeyInitObserver(ObjectMeta.KeyType, new FieldTypeIntrospectionMetaProvider());
        // These keys define scopes for their properties
        this.defineKeyAsPropertyScope(ObjectMeta.KeyField);
        this.defineKeyAsPropertyScope(ObjectMeta.KeyAction);
        this.defineKeyAsPropertyScope(ObjectMeta.KeyActionCategory);
        this.defineKeyAsPropertyScope(ObjectMeta.KeyClass);
        // policies for chaining certain well known properties
        this.registerPropertyMerger(ObjectMeta.KeyVisible, new PropertyMerger_And());
        this.registerPropertyMerger(ObjectMeta.KeyEditable, new PropertyMerger_And());
        this.registerPropertyMerger(ObjectMeta.KeyValid, new OMPropertyMerger_Valid());
        this.registerPropertyMerger(ObjectMeta.KeyClass, Meta.PropertyMerger_DeclareList);
        this.registerPropertyMerger(ObjectMeta.KeyField, Meta.PropertyMerger_DeclareList);
        this.registerPropertyMerger(ObjectMeta.KeyAction, Meta.PropertyMerger_DeclareList);
        this.registerPropertyMerger(ObjectMeta.KeyActionCategory, Meta.PropertyMerger_DeclareList);
        this.registerPropertyMerger(ObjectMeta.KeyTraitGroup, Meta.PropertyMerger_DeclareList);
        this.mirrorPropertyToContext(ObjectMeta.KeyClass, ObjectMeta.KeyClass);
        this.mirrorPropertyToContext(ObjectMeta.KeyType, ObjectMeta.KeyType);
        this.mirrorPropertyToContext(ObjectMeta.KeyElementType, ObjectMeta.KeyElementType);
        this.mirrorPropertyToContext(ObjectMeta.KeyTrait, Meta.KeyTrait);
        this.mirrorPropertyToContext(ObjectMeta.KeyEditable, ObjectMeta.KeyEditable);
        this.registerValueTransformerForKey(ObjectMeta.KeyObject, Meta.Transformer_KeyPresent);
        // todo: try to support decorators and how we can put meta data into object @Traits,
        // @Properties, @Action
    }
    /**
     * @param {?} context
     * @return {?}
     */
    static validationError(context) {
        let /** @type {?} */ error = context.propertyForKey(ObjectMeta.KeyValid);
        if (isBlank(error)) {
            return null;
        }
        if (isBoolean(error)) {
            return BooleanWrapper.boleanValue(error) ? null : 'Invalid entry';
        }
        return error.toString();
    }
    /**
     * @return {?}
     */
    newContext() {
        return new ObjectMetaContext(this, false);
    }
    /**
     * @return {?}
     */
    newPropertiesMap() {
        return new ObjectMetaPropertyMap();
    }
    /**
     * @param {?} context
     * @param {?} key
     * @return {?}
     */
    itemNames(context, key) {
        context.push();
        context.set(ObjectMeta.KeyDeclare, key);
        let /** @type {?} */ itemsNames = context.listPropertyForKey(key);
        context.pop();
        return itemsNames;
    }
    /**
     * @param {?} context
     * @param {?} key
     * @param {?} filterHidden
     * @return {?}
     */
    itemProperties(context, key, filterHidden) {
        return this.itemPropertiesForNames(context, key, this.itemNames(context, key), filterHidden);
    }
    /**
     * @param {?} context
     * @param {?} key
     * @param {?} itemNames
     * @param {?} filterHidden
     * @return {?}
     */
    itemPropertiesForNames(context, key, itemNames, filterHidden) {
        let /** @type {?} */ result = [];
        for (let /** @type {?} */ itemName of itemNames) {
            context.push();
            context.set(key, itemName);
            let /** @type {?} */ isVisible = context.allProperties().get(ObjectMeta.KeyVisible);
            let /** @type {?} */ visible = context.staticallyResolveValue(isVisible);
            let /** @type {?} */ isHidden = (isBlank(visible)) || BooleanWrapper.isFalse(visible);
            if (!isHidden || !filterHidden) {
                result.push(new ItemProperties(itemName, context.allProperties(), isHidden));
            }
            context.pop();
        }
        return result;
    }
    /**
     * @param {?} trait
     * @return {?}
     */
    groupForTrait(trait) {
        if (this._traitToGroup == null || this._traitToGroupGeneration < this.ruleSetGeneration) {
            this._traitToGroupGeneration = this.ruleSetGeneration;
            this._traitToGroup = new Map();
            let /** @type {?} */ context = this.newContext();
            for (let /** @type {?} */ group of this.itemNames(context, ObjectMeta.KeyTraitGroup)) {
                context.push();
                context.set(ObjectMeta.KeyTraitGroup, group);
                for (let /** @type {?} */ name of this.itemNames(context, ObjectMeta.KeyTrait)) {
                    this._traitToGroup.set(name, group);
                }
                context.pop();
            }
        }
        return this._traitToGroup.get(trait);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set injector(value) {
        this._injector = value;
    }
    /**
     * @return {?}
     */
    get injector() {
        return this._injector;
    }
    /**
     * @return {?}
     */
    get componentRegistry() {
        return this._componentRegistry;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set componentRegistry(value) {
        this._componentRegistry = value;
    }
}
ObjectMeta.KeyClass = 'class';
ObjectMeta.KeyField = 'field';
ObjectMeta.KeyAction = 'action';
ObjectMeta.KeyActionCategory = 'actionCategory';
ObjectMeta.KeyObject = 'object';
ObjectMeta.KeyValue = 'value';
ObjectMeta.KeyType = 'type';
ObjectMeta.KeyElementType = 'elementType';
ObjectMeta.KeyTraitGroup = 'traitGroup';
ObjectMeta.KeyVisible = 'visible';
ObjectMeta.KeyEditable = 'editable';
ObjectMeta.KeyValid = 'valid';
ObjectMeta.KeyRank = 'rank';
ObjectMeta.DefaultActionCategory = 'General';
ObjectMeta._FieldPathNullMarker = new FieldPath('null');
/**
 * When a class is pushed either directly or indirectly (using deffered rules) we receive a
 * ValueQueriedObserver notification in order to register  types for the object. Trying to achieve
 * at least some kind of introspection we need to implement $proto method inside the object that
 * instantiates all types which we can query.
 *
 * Ideally we want to use decorators when dealing with client side typescript class. but for cases
 * where Rules will be loaded using Rest API along with the object instance its impossible.
 */
class IntrospectionMetaProvider {
    /**
     * @param {?} meta
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    notify(meta, key, value) {
        this._meta = meta;
        let /** @type {?} */ myObject;
        let /** @type {?} */ componentRegistry = (/** @type {?} */ (this._meta)).componentRegistry;
        assert(isPresent(componentRegistry), 'Component registry is not initialized');
        let /** @type {?} */ clazz = null;
        if (isString(value) && (clazz = componentRegistry.nameToType.get(value))
            && isPresent(clazz)) {
            myObject = new clazz();
        }
        else if (isBlank(clazz)) {
            return;
        }
        assert(Meta.className(myObject) === value, 'Trying to process and register a class that does not exists on Context');
        this.registerRulesForClass(myObject, value);
    }
    /**
     * @param {?} object
     * @param {?} className
     * @return {?}
     */
    registerRulesForClass(object, className$$1) {
        this._meta.keyData(ObjectMeta.KeyClass).setParent(className$$1, 'Object');
        this._meta.beginRuleSet(className$$1);
        try {
            let /** @type {?} */ selectors = [new Selector(ObjectMeta.KeyClass, className$$1)];
            let /** @type {?} */ propertyMap = this._meta.newPropertiesMap();
            selectors[0].isDecl = true;
            let /** @type {?} */ rule = new Rule(selectors, propertyMap, ObjectMeta.ClassRulePriority);
            this._meta.addRule(rule);
            this.registerRulesForFields(object, className$$1);
        }
        finally {
            this._meta.endRuleSet();
        }
    }
    /**
     * @param {?} object
     * @param {?} className
     * @return {?}
     */
    registerRulesForFields(object, className$$1) {
        // todo: Can we somehow utilize decorators? Maybe for local typescript defined object, but
        // not objects loaded as json from rest API
        assert(isPresent(object['$proto']), 'Cannot register fields without a $proto method that will expose all the fields');
        let /** @type {?} */ instance = object['$proto']();
        let /** @type {?} */ fieldNames = Object.keys(instance);
        let /** @type {?} */ rank = 0;
        for (let /** @type {?} */ name of fieldNames) {
            // todo: check=>  can we rely on this ?
            let /** @type {?} */ type = instance[name].constructor.name;
            let /** @type {?} */ properties = new Map();
            properties.set(ObjectMeta.KeyField, name);
            properties.set(ObjectMeta.KeyType, type);
            properties.set(ObjectMeta.KeyVisible, true);
            if (isArray(instance[name])) {
                assert(instance[name].length > 0, ' Cannot register type[array] and its type without properly initialized ' +
                    'prototype');
                let /** @type {?} */ item = instance[name][0];
                let /** @type {?} */ collectionElementType = item.constructor.name;
                properties.set(ObjectMeta.KeyElementType, collectionElementType);
            }
            let /** @type {?} */ selectorList = [
                new Selector(ObjectMeta.KeyClass, className$$1),
                new Selector(ObjectMeta.KeyField, name),
            ];
            selectorList[1].isDecl = true;
            properties.set(ObjectMeta.KeyRank, (rank++ + 1) * 10);
            let /** @type {?} */ rule = new Rule(selectorList, properties, ObjectMeta.ClassRulePriority);
            this._meta.addRule(rule);
        }
    }
}
/**
 * Registers specials types that we are read during introspections
 */
class FieldTypeIntrospectionMetaProvider {
    /**
     * @param {?} meta
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    notify(meta, key, value) {
        // print('FieldTypeIntrospectionMetaProvider notified of first use of field:  ' , value);
    }
}
class ObjectMetaPropertyMap extends PropertyMap {
    /**
     * @return {?}
     */
    get fieldPath() {
        if (isBlank(this._fieldPath)) {
            let /** @type {?} */ value = this.get(ObjectMeta.KeyValue);
            let /** @type {?} */ fieldName = this.get(ObjectMeta.KeyField);
            this._fieldPath = (isPresent(fieldName) && isBlank(value))
                ? new FieldPath(fieldName)
                : ObjectMeta._FieldPathNullMarker;
        }
        let /** @type {?} */ isNullPath = this._fieldPath === ObjectMeta._FieldPathNullMarker;
        return isNullPath ? null : this._fieldPath;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    isFieldNullMarker(value) {
        return isPresent(value) && value.path === 'null';
    }
}
class OMPropertyMerger_Valid {
    constructor() {
        this.isPropMergerIsChainingMark = true;
    }
    /**
     * @param {?} orig
     * @param {?} override
     * @param {?} isDeclare
     * @return {?}
     */
    merge(orig, override, isDeclare) {
        // if first is error (error message or false, it wins), otherwise second
        return (isString(override) || (isBoolean(override) && BooleanWrapper.isFalse(override))) ? override : orig;
    }
    /**
     * @return {?}
     */
    toString() {
        return 'VALIDATE';
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 *  This is generated file. Do not edit !!
 *
 * \@formatter:off
 *
 */
const /** @type {?} */ SystemRules = {
    oss: [
        {
            '_selectors': [
                {
                    '_key': 'object',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'class': {
                    't': 'Expr',
                    'v': 'Meta.className(object)'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'object',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'declare',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'class': {
                    't': 'Expr',
                    'v': 'Meta.className(object)'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': 'search',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'class': {
                    't': 'Expr',
                    'v': 'values.get("class")'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create',
                        'search'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editing': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'operation',
                    '_value': [
                        'view',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': {
                    't': 'SDW',
                    'v': '!properties.get("hidden")'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'editing',
                    '_value': true,
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editable': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'editing',
                    '_value': false,
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editable': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'fiveZones',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'fiveZoneLayout': true,
                'zones': [
                    'zLeft',
                    'zMiddle',
                    'zRight',
                    'zTop',
                    'zBottom',
                    'zDetail'
                ]
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'oneZone',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'zones': [
                    'zLeft',
                    'zDetail'
                ]
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'tableZones',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'zones': [
                    'zMain',
                    'zLeft',
                    'zRight',
                    'zTop',
                    'zBottom',
                    'zDetail'
                ]
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'create',
                        'edit',
                        'view',
                        'search'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'trait': 'fiveZones'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'list',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'trait': 'tableZones'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FormZones',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FormZones',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'fiveZones',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FormZones',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FormZones',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'oneZone',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FormZones',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'StringComponent',
                'bindings': {
                    'value': {
                        't': 'CFP',
                        'v': 'value'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'boolean',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'boolean',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'Checkbox'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'boolean',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Number',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'formatter': {
                        't': 'CFP',
                        'v': 'formatters.integer'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Number',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'InputFieldComponent'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Number',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Number',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'search',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'formatter': {
                        't': 'CFP',
                        'v': 'formatters.blankNull.integer'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Number',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Date',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'DateAndTimeComponent',
                'bindings': {
                    'formatter': 'shortDate',
                    'showTime': false
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Date',
                    '_isDecl': false
                },
                {
                    '_key': 'fiveZoneLayout',
                    '_value': true,
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Date',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Date',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'dateTime',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'formatter': 'dateTime',
                    'showTime': true
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Date',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'java.lang.Enum',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'java.lang.Enum',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'GenericChooserComponent',
                'bindings': {
                    'destinationClass': {
                        't': 'Expr',
                        'v': 'type'
                    },
                    'displayKey': 'name',
                    'formatter': {
                        't': 'CFP',
                        'v': 'formatters.identifier'
                    },
                    'key': {
                        't': 'Expr',
                        'v': 'field'
                    },
                    'object': {
                        't': 'Expr',
                        'v': 'object'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'java.lang.Enum',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'search',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'type': 'Popup'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'java.lang.Enum',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'java.lang.Enum',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': [
                        'Array',
                        'Set'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': [
                        'Array',
                        'Set'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'enum',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'GenericChooserComponent',
                'bindings': {
                    'multiselect': true,
                    'destinationClass': {
                        't': 'Expr',
                        'v': 'properties.get("enumClass")'
                    },
                    'displayKey': 'name',
                    'formatter': {
                        't': 'CFP',
                        'v': 'formatters.identifier'
                    },
                    'key': {
                        't': 'Expr',
                        'v': 'field'
                    },
                    'object': {
                        't': 'Expr',
                        'v': 'object'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': [
                        'Array',
                        'Set'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': [
                        'Array',
                        'Set'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'search',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': [
                        'Array',
                        'Set'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': [
                        'Array',
                        'Set'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'ownedToMany',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaDetailTable',
                'after': 'zDetail'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': [
                        'Array',
                        'Set'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': '[B',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': '[B',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'FileUploadChooser',
                'bindings': {
                    'bytes': {
                        't': 'CFP',
                        'v': 'value'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': '[B',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': '[B',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': false,
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'value': {
                        't': 'Expr',
                        'v': 'value ? ("" + value.length + " bytes") : "(none)"'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': '[B',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'File',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'File',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'FileUploadChooser',
                'bindings': {
                    'file': {
                        't': 'CFP',
                        'v': 'value'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'File',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'File',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': false,
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'value': {
                        't': 'Expr',
                        'v': 'value ? value.name : "(none)"'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'File',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'InputFieldComponent'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'longtext',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'after': 'zBottom'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'longtext',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'TextAreaComponent',
                'bindings': {
                    'rows': 10,
                    'cols': 60
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'longtext',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'longtext',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'search',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'longtext',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'bindings': {
                    'escapeUnsafeHtml': true
                },
                'after': 'zBottom'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'RichTextArea',
                'bindings': {
                    'rows': 10,
                    'cols': 60
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': 'search',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'after': 'zNone'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': 'list',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'editable': false,
                'after': 'zDetail'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'secret',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'bindings': {
                    'formatter': {
                        't': 'CFP',
                        'v': 'formatters.hiddenPassword'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'secret',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'AWPasswordField',
                'bindings': {}
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'secret',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'secret',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'search',
                        'list'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'secret',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'truncated',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'TruncateString',
                'bindings': {
                    'size': 10
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'String',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Binary',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Binary',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'imageData',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'contentType': 'image/jpeg'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Binary',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'imageData',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': false,
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'AWImageData',
                'bindings': {
                    'bytes': {
                        't': 'CFP',
                        'v': 'value'
                    },
                    'contentType': {
                        't': 'Expr',
                        'v': 'ContentTypeUtils.contentTypeNamed(properties.get("contentType"))'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Binary',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'imageData',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Binary',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'imageData',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'awcontentLayouts': {
                        '_main': '_imgUploadPreview'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Binary',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'imageData',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Binary',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'type',
                    '_value': 'Money',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'CurrencyComponent',
                'bindings': {
                    'money': {
                        't': 'CFP',
                        'v': 'value'
                    },
                    'currencies': {
                        't': 'Expr',
                        'v': 'properties.get("currencies")'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': '_imgUploadPreview',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'wrapperComponent': 'MetaContext',
                'component': 'AWImageData',
                'wrapperBindings': {
                    'scopeKey': 'field'
                },
                'bindings': {
                    'bytes': {
                        't': 'CFP',
                        'v': 'value'
                    },
                    'style': 'width:100px',
                    'contentType': {
                        't': 'Expr',
                        'v': 'ContentTypeUtils.contentTypeNamed(properties.get("contentType"))'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'derived',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'editable': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'derived',
                    '_isDecl': true
                },
                {
                    '_key': 'editing',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'after': 'zNone'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'derived',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'searchable',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'searchable',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': 'search',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': true,
                'editable': {
                    't': 'OV',
                    'v': 'true'
                },
                'after': {
                    't': 'OV',
                    'v': 'null'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'searchable',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'required',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'required',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'required': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'required',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'object',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'valid': {
                    't': 'Expr',
                    'v': '((value != undefined) && (value != null)) ? true : "Answer required"'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'required',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': [
                        'edit',
                        'create'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'required',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'list',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'list',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'GenericChooserComponent',
                'bindings': {
                    'list': {
                        't': 'Expr',
                        'v': 'properties.get("choices")'
                    },
                    'type': {
                        't': 'Expr',
                        'v': 'properties.get("chooserStyle")'
                    },
                    'key': {
                        't': 'Expr',
                        'v': 'properties.get("field")'
                    },
                    'object': {
                        't': 'Expr',
                        'v': 'object'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'list',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'withHoverDetails',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'withHoverDetails',
                    '_isDecl': true
                },
                {
                    '_key': 'editable',
                    '_value': false,
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'HoverCardComponent',
                'bindings': {
                    'linkTitle': {
                        't': 'CFP',
                        'v': 'value'
                    },
                    'appendContentToBody': false,
                    'ngcontentLayout': 'Content'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'withHoverDetails',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': 'Content',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaObjectDetailComponent',
                'bindings': {
                    'layout': 'Inspect',
                    'object': {
                        't': 'CFP',
                        'v': 'value'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'noCreate',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'noCreate',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': 'create',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'noCreate',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'noSearch',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'noSearch',
                    '_isDecl': true
                },
                {
                    '_key': 'operation',
                    '_value': 'search',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'noSearch',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'Popup',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'bindings': {
                    'type': 'Dropdown'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'PopupControl',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'bindings': {
                    'type': 'PopupControl'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'Chooser',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'bindings': {
                    'type': 'Chooser'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'PostOnChange',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'bindings': {}
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'GenericChooserComponent',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'bold',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'wrapperComponent': 'GenericContainerComponent',
                'wrapperBindings': {
                    'tagName': 'b'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'italic',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'wrapperComponent': 'GenericContainerComponent',
                'wrapperBindings': {
                    'tagName': 'i'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'heading1',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'wrapperComponent': 'GenericContainerComponent',
                'wrapperBindings': {
                    'tagName': 'h1'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'heading2',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'wrapperComponent': 'GenericContainerComponent',
                'wrapperBindings': {
                    'tagName': 'h2'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'heading3',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'wrapperComponent': 'GenericContainerComponent',
                'wrapperBindings': {
                    'tagName': 'h3'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': [
                        'StringComponent',
                        'AWHyperlink',
                        'PopupMenuLink'
                    ],
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FieldType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FieldType',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'longtext',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FieldType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FieldType',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'richtext',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FieldType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FieldType',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'secret',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'FieldType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'ChooserType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'ChooserType',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'Popup',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'ChooserType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'ChooserType',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'PopupControl',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'ChooserType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'ChooserType',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'Chooser',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'ChooserType',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'bold',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'italic',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'heading1',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'heading2',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'heading3',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'WrapperStyle',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': {
                    't': 'SDW',
                    'v': '!properties.get("hidden")'
                },
                'enabled': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'pageAction',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'actionResults': {
                    't': 'Expr',
                    'v': 'meta.routingService.routeForPage(properties.get("pageName"))'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'modalComponentPage',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'pageBindings': {
                    'componentName': {
                        't': 'Expr',
                        'v': 'properties.get("componentName")'
                    },
                    'title': {
                        't': 'Expr',
                        'v': 'properties.get("title")'
                    }
                },
                'actionResults': {
                    't': 'Expr',
                    'v': 'meta.compPageWithName("MetaModalPage")'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'modalComponentPanel',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'pageBindings': {
                    'clientPanel': true,
                    'componentName': {
                        't': 'Expr',
                        'v': 'properties.get("componentName")'
                    },
                    'title': {
                        't': 'Expr',
                        'v': 'properties.get("title")'
                    }
                },
                'actionResults': {
                    't': 'Expr',
                    'v': 'meta.compPageWithName("MetaModalPage")'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'messageResults',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'actionResults': {
                    't': 'Expr',
                    'v': 'var o = (properties.isInstanceAction ? object : ariba.ui.aribaweb.util.AWUtil.classForName(properties.class)), var v = ariba.util.fieldvalue.FieldValue.getFieldValue(o, properties.action), var m = ariba.util.core.Fmt.S(properties.message, v), ariba.ui.widgets.AribaPageContent.setMessage(m, requestContext.session()), null'
                },
                'message': 'Action Performed: %s'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'instance',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'isInstanceAction': true,
                'enabled': {
                    't': 'Expr',
                    'v': 'object != null'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'filterActions',
                    '_value': 'instance',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': {
                    't': 'Expr',
                    'v': 'properties.get("isInstanceAction") == true'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'filterActions',
                    '_value': 'static',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': {
                    't': 'Expr',
                    'v': '!properties.get("isInstanceAction")'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'zones': [
                    'zMain'
                ]
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'ActionButtons',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaActionListComponent',
                'visible': true,
                'bindings': {
                    'defaultStyle': 'primary',
                    'renderAs': 'buttons',
                    'align': 'right'
                },
                'elementClass': 'l-action-buttons'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'ActionLinks',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaActionListComponent',
                'visible': true,
                'bindings': {
                    'renderAs': 'links',
                    'align': 'right'
                },
                'elementClass': 'l-action-buttons'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'ActionMenu',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaActionListComponent',
                'visible': true,
                'bindings': {
                    'renderAs': 'menu',
                    'align': 'right'
                },
                'elementClass': 'l-action-buttons'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'InstanceActionButtons',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaActionListComponent',
                'visible': true,
                'bindings': {
                    'filterActions': 'instance',
                    'renderAs': 'buttons',
                    'align': 'right'
                },
                'elementClass': 'l-action-buttons'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'StaticActionButtons',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaActionListComponent',
                'visible': true,
                'bindings': {
                    'filterActions': 'static',
                    'renderAs': 'buttons',
                    'align': 'right'
                },
                'elementClass': 'l-action-buttons'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'Tabs',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaTabs',
                'visible': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'Sections',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaSectionsComponent',
                'visible': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'Form',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaFormComponent',
                'visible': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'Stack',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaElementListComponent',
                'visible': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'OwnZone',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'zonePath': {
                    't': 'Expr',
                    'v': 'layout'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'pad8',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'wrapperComponent': 'GenericContainerComponent',
                'wrapperBindings': {
                    'style': 'padding:8px',
                    'tagName': 'div'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'component',
                    '_value': 'MetaFormComponent',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'labelsOnTop',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'layout_trait',
                    '_value': 'labelsOnTop',
                    '_isDecl': false
                },
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'bindings': {
                    'showLabelsAboveControls': true
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'Tabs',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'Sections',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'Form',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'Stack',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'LayoutGrouping',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': [
                        'Inspect',
                        'SearchForm'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'trait': 'Form',
                'label': {
                    't': 'Expr',
                    'v': 'UIMeta.beautifyClassName(values.class)'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': {},
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': [
                        'Inspect',
                        'SearchForm'
                    ],
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'StringComponent',
                'bindings': {}
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'InspectWithActions',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'trait': 'Stack'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'InspectWithActions',
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': 'Actions',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'trait': 'ActionMenu'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'InspectWithActions',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'InspectWithActions',
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': 'Inspect',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'trait': 'Form'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'InspectWithActions',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'ButtonArea',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'trait': 'StaticActionButtons'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'SelectionButtonArea',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'trait': 'InstanceActionButtons'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'Links',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'trait': 'ActionLinks'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'LabelField',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'LabelField',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'labelField',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'visible': {
                    't': 'OV',
                    'v': 'true'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'LabelField',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': [
                        'Table',
                        'DetailTable'
                    ],
                    '_isDecl': false
                },
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'MetaTable',
                'bindings': {
                    'enableScrolling': true,
                    'showSelectionColumn': false,
                    'displayGroup': {
                        't': 'CFP',
                        'v': 'displayGroup'
                    },
                    'title': {
                        't': 'Expr',
                        'v': 'properties.get("label")'
                    },
                    'submitOnSelectionChange': true,
                    'singleSelect': true
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'layout',
                    '_value': 'ListItem',
                    '_isDecl': false
                },
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'StringComponent',
                'bindings': {
                    'value': {
                        't': 'Expr',
                        'v': 'properties.get("objectTitle")'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'object',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'objectTitle': {
                    't': 'Expr',
                    'v': 'FieldPath.getFieldValue(object, meta.displayKeyForClass(values.get("class")))'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'object',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'objectTitle': {
                    't': 'Expr',
                    'v': 'FieldPath.getFieldValue(object, meta.displayKeyForClass(values.get("class")))'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'module',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'pageBindings': {
                    't': 'Expr',
                    'v': '(properties.get("homePage") == "MetaHomePageComponent") ? new Map().set("module", values.get("module")) : null'
                },
                'component': 'MetaDashboardLayoutComponent',
                'visible': {
                    't': 'SDW',
                    'v': '!properties.get("hidden")'
                },
                'homePage': 'MetaHomePageComponent'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'module',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'layout',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'module',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'module',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'ActionTOC',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'module',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'ActionTOC',
                    '_isDecl': true
                },
                {
                    '_key': 'layout',
                    '_value': 'Actions',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'component': 'MetaActionListComponent',
                'label': 'Actions',
                'after': 'zToc'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'module',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'ActionTOC',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'module',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'actionCategory',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': {
                    't': 'SDW',
                    'v': '!properties.get("hidden")'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'actionCategory',
                    '_value': 'General',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'after': 'zMain',
                'label': {
                    't': 'i18n',
                    'v': {
                        'key': 'a001',
                        'defVal': 'General'
                    }
                }
            },
            '_rank': 0
        }
    ]
};
/* tslint:disable */
/**
 *  @formatter:on
 *
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 *  This is generated file. Do not edit !!
 *
 * \@formatter:off
 *
 */
const /** @type {?} */ SystemPersistenceRules = {
    oss: [
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'displayKey': 'toString',
                'searchOperation': 'search'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'Searchable',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'textSearchSupported': true,
                'searchOperation': 'keywordSearch'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'keywordSearch',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'useTextIndex': true
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'keywordSearch',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': false
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'keywordSearch',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'keywordSearch',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': 'keywords',
                    '_isDecl': true
                }
            ],
            '_properties': {
                'visible': {
                    't': 'OV',
                    'v': 'true'
                },
                'bindings': {
                    'size': 30
                },
                'trait': 'SearchableProperty',
                'rank': 0,
                'after': 'zTop',
                'type': 'java.lang.String'
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'keywordSearch',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'textSearch',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'textSearch',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'textSearch',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'SearchableProperty',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'visible': {
                    't': 'OV',
                    'v': 'true'
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'textSearch',
                    '_isDecl': false
                },
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'operation',
                    '_value': 'textSearch',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'class',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'toOneRelationship',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'toOneRelationship',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'GenericChooserComponent',
                'bindings': {
                    'destinationClass': {
                        't': 'Expr',
                        'v': 'elementType'
                    },
                    'multiselect': false,
                    'displayKey': {
                        't': 'Expr',
                        'v': 'meta.displayLabel(type, properties.get("labelField"))'
                    },
                    'type': 'Dropdown',
                    'key': {
                        't': 'Expr',
                        'v': 'field'
                    },
                    'object': {
                        't': 'Expr',
                        'v': 'object'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'toOneRelationship',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'toManyChooser',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'toManyChooser',
                    '_isDecl': false
                },
                {
                    '_key': 'editable',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'GenericChooserComponent',
                'bindings': {
                    'destinationClass': {
                        't': 'Expr',
                        'v': 'elementType'
                    },
                    'multiselect': true,
                    'displayKey': {
                        't': 'Expr',
                        'v': 'meta.displayLabel(type, properties.get("labelField"))'
                    },
                    'type': 'Chooser',
                    'key': {
                        't': 'Expr',
                        'v': 'field'
                    },
                    'object': {
                        't': 'Expr',
                        'v': 'object'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'toManyChooser',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                },
                {
                    '_key': 'trait',
                    '_value': 'toManyLink',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'component': 'AWHyperlink',
                'bindings': {
                    'omitTags': {
                        't': 'Expr',
                        'v': '!value || (value.size() == 0)'
                    },
                    'awcontent': {
                        't': 'Expr',
                        'v': 'value ? ("" + value.size() + " items") : "(none)"'
                    },
                    'action': {
                        't': 'Expr',
                        'v': 'set("object", value), set("actionCategory", "General"), set("action", "Inspect"), ariba.ui.meta.core.UIMeta.getInstance().fireAction(this, requestContext)'
                    }
                }
            },
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'field',
                    '_value': '*',
                    '_isDecl': false
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'RelViewers',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'RelViewers',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'toOneRelationship',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'RelViewers',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'RelViewers',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'toManyChooser',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'RelViewers',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'RelViewers',
                    '_isDecl': true
                },
                {
                    '_key': 'trait',
                    '_value': 'toManyLink',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'traitGroup',
                    '_value': 'RelViewers',
                    '_isDecl': true
                }
            ],
            '_rank': 0
        },
        {
            '_selectors': [
                {
                    '_key': 'action',
                    '_value': 'Inspect',
                    '_isDecl': false
                }
            ],
            '_properties': {
                'pageBindings': {
                    'layout': 'Inspect',
                    'clientPanel': true,
                    'operation': 'view',
                    'object': {
                        't': 'Expr',
                        'v': 'object'
                    }
                },
                'visible': true,
                'trait': 'pageAction',
                'pageName': 'MetaContentPageComponent'
            },
            '_rank': 0
        }
    ]
};
/* tslint:disable */
/**
 *  @formatter:on
 *
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * UIMeta is responsible setting layouts and all around this. We can either use this as a singleton
 * or use it as a service using Angular \@Inject()
 * Right now we use still singleton as we need this class as a library for some other projects
 *
 *
 * todo: Convert to Injectable
 */
class UIMeta extends ObjectMeta {
    constructor() {
        super();
        // if (isPresent(loader)) {
        //     this.registerLoader(loader);
        // }
        try {
            this.beginRuleSet('UIMeta');
            this.registerKeyInitObserver(UIMeta.KeyClass, new UserMetaDataProvider());
            // These keys define scopes for their properties
            // defineKeyAsPropertyScope(KeyArea);
            this.defineKeyAsPropertyScope(UIMeta.KeyLayout);
            this.defineKeyAsPropertyScope(UIMeta.KeyModule);
            // Default rule for converting field name to label
            this.registerDefaultLabelGeneratorForKey(UIMeta.KeyClass);
            this.registerDefaultLabelGeneratorForKey(UIMeta.KeyField);
            this.registerDefaultLabelGeneratorForKey(UIMeta.KeyLayout);
            this.registerDefaultLabelGeneratorForKey(UIMeta.KeyModule);
            this.registerDefaultLabelGeneratorForKey(UIMeta.KeyAction);
            this.registerDefaultLabelGeneratorForKey(UIMeta.KeyActionCategory);
            // policies for chaining certain well known properties
            this.registerPropertyMerger(UIMeta.KeyArea, Meta.PropertyMerger_DeclareList);
            this.registerPropertyMerger(UIMeta.KeyLayout, Meta.PropertyMerger_DeclareList);
            this.registerPropertyMerger(UIMeta.KeyModule, Meta.PropertyMerger_DeclareList);
            this.mirrorPropertyToContext(UIMeta.KeyEditing, UIMeta.KeyEditing);
            this.mirrorPropertyToContext(UIMeta.KeyLayout, UIMeta.KeyLayout);
            this.mirrorPropertyToContext(UIMeta.KeyComponentName, UIMeta.KeyComponentName);
            this.registerPropertyMerger(UIMeta.KeyEditing, new PropertyMerger_And());
            // this.registerValueTransformerForKey('requestContext', UIMeta.Transformer_KeyPresent);
            // this.registerValueTransformerForKey('displayGroup', UIMeta.Transformer_KeyPresent);
            // define operation hierarchy
            this.keyData(UIMeta.KeyOperation).setParent('view', 'inspect');
            this.keyData(UIMeta.KeyOperation).setParent('print', 'view');
            this.keyData(UIMeta.KeyOperation).setParent('edit', 'inspect');
            this.keyData(UIMeta.KeyOperation).setParent('search', 'inspect');
            this.keyData(UIMeta.KeyOperation).setParent('keywordSearch', 'search');
            this.keyData(UIMeta.KeyOperation).setParent('textSearch', 'keywordSearch');
            this.registerStaticallyResolvable(UIMeta.PropFieldsByZone, new PropFieldsByZoneResolver(), UIMeta.KeyClass);
            this.registerStaticallyResolvable(UIMeta.PropFieldPropertyList, new PropFieldPropertyListResolver(), UIMeta.KeyClass);
            this.registerStaticallyResolvable(UIMeta.PropLayoutsByZone, new PropLayoutsByZoneResolver(), UIMeta.KeyLayout);
            // this.registerStaticallyResolvable(UIMeta.PropLayoutsByZone , new
            // PropLayoutsByZoneResolver() , UIMeta.KeyLayout);
            // registerStaticallyResolvable('bindingsDictionary' , dyn , KeyField);
            // registerStaticallyResolvable('bindingsDictionary' , dyn , KeyLayout);
            // registerStaticallyResolvable('bindingsDictionary' , dyn , KeyClass);
            // registerStaticallyResolvable('bindingsDictionary' , dyn , KeyModule);
        }
        finally {
            this.endRuleSet();
        }
    }
    /**
     * @return {?}
     */
    static getInstance() {
        return this._instance || (this._instance = new this());
    }
    /**
     * @param {?} fieldName
     * @return {?}
     */
    static defaultLabelForIdentifier(fieldName) {
        let /** @type {?} */ lastDot = fieldName.lastIndexOf('.');
        if (lastDot !== -1 && lastDot !== fieldName.length - 1) {
            fieldName = fieldName.substring(lastDot + 1);
        }
        return decamelize(fieldName);
    }
    /**
     * @param {?} className
     * @return {?}
     */
    static beautifyClassName(className$$1) {
        return decamelize(className$$1, ' ');
    }
    /**
     * @param {?} field
     * @return {?}
     */
    static beautifyFileName(field) {
        return decamelize(field, ' ');
    }
    /**
     * @param {?} context
     * @return {?}
     */
    zones(context) {
        let /** @type {?} */ zones = context.propertyForKey('zones');
        return (isBlank(zones)) ? Meta.toList(UIMeta.ZoneMain) : zones;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    zonePath(context) {
        let /** @type {?} */ zonePath;
        if (isPresent(context.values.get(UIMeta.KeyLayout))) {
            context.push();
            context.setScopeKey(UIMeta.KeyLayout);
            zonePath = context.propertyForKey(UIMeta.KeyZonePath);
            context.pop();
        }
        return zonePath;
    }
    /**
     * @param {?=} isNested
     * @return {?}
     */
    newContext(isNested = false) {
        return new UIContext(this, isNested);
    }
    /**
     * @param {?=} references
     * @return {?}
     */
    loadDefaultRuleFiles(references) {
        if (isPresent(SystemRules.oss)) {
            this.beginRuleSetWithRank(Meta.SystemRulePriority, 'system');
            try {
                this._loadRules(SystemRules.oss, 'system', false);
            }
            finally {
                this.endRuleSet();
            }
        }
        if (isPresent(SystemPersistenceRules.oss)) {
            this.beginRuleSetWithRank(Meta.SystemRulePriority + 2000, 'system-persistence');
            try {
                this._loadRules(SystemPersistenceRules.oss, 'system-persistence', false);
            }
            finally {
                this.endRuleSet();
            }
        }
        if (isPresent(references)) {
            this.registerComponents(references);
        }
        return false;
    }
    /**
     * loads application level rules. Application level rules are global rules
     * @return {?}
     */
    loadApplicationRules() {
        let /** @type {?} */ aRules;
        let /** @type {?} */ userReferences;
        let /** @type {?} */ appRuleFiles = ['Application'];
        if (isPresent(this.appConfig)) {
            appRuleFiles = this.appConfig.get(UIMeta.AppConfigRuleFilesParam) || ['Application'];
            userReferences = this.appConfig.get(UIMeta.AppConfigUserRulesParam);
            // make sure we have always Application and make it more additive.
            if (!ListWrapper.contains(appRuleFiles, 'Application')) {
                appRuleFiles.unshift('Application');
            }
        }
        for (let /** @type {?} */ ruleFile of appRuleFiles) {
            let /** @type {?} */ rule = ruleFile + 'Rule';
            if (this._testRules.has(rule)) {
                // since we are in development mode and test mode is on we can check extra
                // repository used by tests, we need to check if we are not running unittest
                // and a class is not defined but unittest
                if (this._testRules.has(rule) &&
                    isPresent(this._testRules.get(rule).oss)) {
                    aRules = this._testRules.get(rule).oss;
                    if (isPresent(aRules)) {
                        this.beginRuleSetWithRank(Meta.LowRulePriority, ruleFile.toLowerCase());
                        try {
                            this._loadRules(aRules, ruleFile.toLowerCase(), false);
                        }
                        finally {
                            this.endRuleSet();
                        }
                    }
                }
            }
            else {
                for (let /** @type {?} */ i in userReferences) {
                    let /** @type {?} */ userRule = userReferences[i];
                    if (isPresent(userRule)) {
                        if (isPresent(userRule[rule]) && isPresent(userRule[rule].oss)) {
                            aRules = userRule[rule].oss;
                        }
                    }
                    if (isPresent(aRules)) {
                        this.beginRuleSetWithRank(Meta.LowRulePriority, ruleFile.toLowerCase());
                        try {
                            this._loadRules(aRules, ruleFile.toLowerCase(), false);
                        }
                        finally {
                            this.endRuleSet();
                        }
                    }
                }
            }
        }
    }
    /**
     * @param {?} source
     * @param {?} userClass
     * @return {?}
     */
    loadUserRule(source, userClass) {
        if (isPresent(source)) {
            this.beginRuleSetWithRank(this._ruleCount, 'user:' + userClass);
            try {
                this._loadRules(source, 'user', false);
            }
            finally {
                this.endRuleSet();
            }
        }
        return false;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    defaultLabelGeneratorForKey(key) {
        return new _DefaultLabelGenerator(key);
    }
    /**
     * @param {?} propKey
     * @param {?} dynamicValue
     * @param {?} contextKey
     * @param {?} contextValue
     * @return {?}
     */
    registerDerivedValue(propKey, dynamicValue, contextKey, contextValue) {
        let /** @type {?} */ m = new Map();
        m.set(propKey, dynamicValue);
        this.addRule(new Rule(Meta.toList(new Selector(contextKey, contextValue)), m, Meta.SystemRulePriority));
    }
    /**
     * @param {?} propKey
     * @param {?} dynamicValue
     * @param {?} contextKey
     * @return {?}
     */
    registerStaticallyResolvable(propKey, dynamicValue, contextKey) {
        this.registerDerivedValue(propKey, new StaticDynamicWrapper(dynamicValue), contextKey, Meta.KeyAny);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    registerDefaultLabelGeneratorForKey(key) {
        this.registerDerivedValue(UIMeta.KeyLabel, new LocalizedLabelString(this), key, UIMeta.KeyAny);
    }
    /**
     * @param {?} context
     * @return {?}
     */
    fieldList(context) {
        return this.itemList(context, UIMeta.KeyField, UIMeta.ZonesTLRMB);
    }
    /**
     * @param {?} context
     * @return {?}
     */
    fieldsByZones(context) {
        return this.itemsByZones(context, UIMeta.KeyField, UIMeta.ZonesTLRMB);
    }
    /**
     * @param {?} context
     * @param {?} key
     * @param {?} zones
     * @return {?}
     */
    itemNamesByZones(context, key, zones) {
        let /** @type {?} */ itemsByZones = this.itemsByZones(context, key, zones);
        return this.mapItemPropsToNames(itemsByZones);
    }
    /**
     * @param {?} itemsByZones
     * @return {?}
     */
    mapItemPropsToNames(itemsByZones) {
        let /** @type {?} */ namesByZones = new Map();
        MapWrapper.iterable(itemsByZones).forEach((value, key) => {
            if (isPresent(value) && isArray(value)) {
                let /** @type {?} */ names = [];
                for (let /** @type {?} */ item of value) {
                    if (item instanceof ItemProperties) {
                        names.push((/** @type {?} */ (item)).name);
                    }
                }
                namesByZones.set(key, names);
            }
            else {
                namesByZones.set(key, this.mapItemPropsToNames(value));
            }
        });
        return namesByZones;
    }
    /**
     * @param {?} context
     * @param {?} key
     * @param {?} defaultPredecessor
     * @return {?}
     */
    predecessorMap(context, key, defaultPredecessor) {
        let /** @type {?} */ fieldInfos = this.itemProperties(context, key, false);
        let /** @type {?} */ predecessors = MapWrapper.groupBy(fieldInfos, (item) => {
            let /** @type {?} */ pred = item.properties.get(UIMeta.KeyAfter);
            return isPresent(pred) ? pred : defaultPredecessor;
        });
        return predecessors;
    }
    /**
     * @param {?} context
     * @param {?} key
     * @param {?} zones
     * @return {?}
     */
    itemList(context, key, zones) {
        let /** @type {?} */ predecessors = this.predecessorMap(context, key, zones[0]);
        let /** @type {?} */ result = [];
        for (let /** @type {?} */ zone of zones) {
            this.accumulatePrecessors(predecessors, zone, result);
        }
        return result;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    isZoneReference(key) {
        // keys of the form 'z<Name>' and 'foo.bar.z<Name>' are considered zone keys
        let /** @type {?} */ lastDot = key.lastIndexOf('.');
        let /** @type {?} */ suffix = (lastDot === -1) ? key : key.substring(lastDot + 1);
        return (suffix.length > 1) && (suffix[0] === 'z') && (suffix[1].toUpperCase() === suffix[1] // is uppercase ?s
        );
    }
    /**
     * @param {?} context
     * @param {?} property
     * @param {?} zones
     * @return {?}
     */
    itemsByZones(context, property, zones) {
        let /** @type {?} */ predecessors = this.predecessorMap(context, property, zones[0]);
        let /** @type {?} */ byZone = new Map();
        MapWrapper.iterable(predecessors).forEach((value, zone) => {
            if (this.isZoneReference(zone)) {
                let /** @type {?} */ list = [];
                this.accumulatePrecessors(predecessors, zone, list);
                FieldPath.setFieldValue(byZone, zone, list);
            }
        });
        return byZone;
    }
    /**
     * @param {?} predecessors
     * @param {?} key
     * @param {?} result
     * @return {?}
     */
    accumulatePrecessors(predecessors, key, result) {
        let /** @type {?} */ items = predecessors.get(key);
        if (isBlank(items)) {
            return;
        }
        ListWrapper.sort(items, (o1, o2) => {
            let /** @type {?} */ r1 = o1.properties.get(UIMeta.KeyRank);
            let /** @type {?} */ r2 = o2.properties.get(UIMeta.KeyRank);
            if (r1 === null) {
                r1 = 100;
            }
            if (r2 === null) {
                r2 = 100;
            }
            return (r1 === r2) ? 0 : (r1 === null) ? 1 : (r2 === null) ? -1 : (r1 - r2);
        });
        for (let /** @type {?} */ item of items) {
            if (!item.hidden) {
                result.push(item);
            }
            this.accumulatePrecessors(predecessors, item.name, result);
        }
    }
    /**
     * Called by Parser to handle decls like 'zLeft => lastName#required'
     *
     * @param {?} itemName
     * @param {?} contextPreds
     * @param {?} predecessor
     * @param {?} traits
     * @param {?} lineNumber
     * @return {?}
     */
    addPredecessorRule(itemName, contextPreds, predecessor, traits, lineNumber) {
        if (isBlank(predecessor) && isBlank(traits)) {
            return null;
        }
        let /** @type {?} */ key = this.scopeKeyForSelector(contextPreds);
        if (isBlank(key) || key === UIMeta.KeyClass) {
            key = UIMeta.KeyField;
        }
        let /** @type {?} */ selector = new Array();
        ListWrapper.addAll(selector, contextPreds);
        selector.push(new Selector(key, itemName));
        let /** @type {?} */ props = new Map();
        if (isPresent(predecessor)) {
            props.set(UIMeta.KeyAfter, predecessor);
        }
        if (isPresent(traits)) {
            props.set(UIMeta.KeyTrait, traits);
        }
        let /** @type {?} */ rule = new Rule(selector, props, 0, lineNumber);
        this.addRule(rule);
        return rule;
    }
    /**
     * @param {?} fieldsByZones
     * @param {?} zoneList
     * @param {?} key
     * @param {?} context
     * @return {?}
     */
    flattenVisible(fieldsByZones, zoneList, key, context) {
        let /** @type {?} */ result = [];
        if (isPresent(fieldsByZones)) {
            for (let /** @type {?} */ zone of zoneList) {
                let /** @type {?} */ fields = fieldsByZones.get(zone);
                if (isBlank(fields)) {
                    continue;
                }
                for (let /** @type {?} */ field of fields) {
                    context.push();
                    context.set(key, field);
                    if (context.booleanPropertyForKey(UIMeta.KeyVisible, false)) {
                        result.push(field);
                    }
                    context.pop();
                }
            }
        }
        return result;
    }
    /**
     * @param {?} className
     * @return {?}
     */
    displayKeyForClass(className$$1) {
        // performance: should use registerDerivedValue('...', new Context.StaticDynamicWrapper
        // to get cached resolution here...
        let /** @type {?} */ context = this.newContext();
        context.set(UIMeta.KeyLayout, 'LabelField');
        context.set(UIMeta.KeyClass, className$$1);
        let /** @type {?} */ fields = this.itemProperties(context, UIMeta.KeyField, true);
        return ListWrapper.isEmpty(fields) ? '$toString' : fields[0].name;
    }
    /**
     * @param {?} className
     * @param {?} propertiesValue
     * @return {?}
     */
    displayLabel(className$$1, propertiesValue) {
        if (isPresent(propertiesValue)) {
            return propertiesValue;
        }
        return this.displayKeyForClass(className$$1);
    }
    /**
     * @param {?} key
     * @param {?} defaultValue
     * @return {?}
     */
    createLocalizedString(key, defaultValue) {
        assert(isPresent(this._currentRuleSet), 'Attempt to create localized string without currentRuleSet in place');
        return new LocalizedString(this, this._currentRuleSet.filePath, key, defaultValue);
    }
    /**
     * @return {?}
     */
    get routingService() {
        return (isPresent(this._injector)) ? this._injector.get(RoutingService) : null;
    }
    /**
     * @return {?}
     */
    get env() {
        return (isPresent(this._injector)) ? this._injector.get(Environment) : new Environment();
    }
    /**
     * @return {?}
     */
    get appConfig() {
        return (isPresent(this._injector)) ? this._injector.get(AppConfig) : null;
    }
    /**
     * Registers framework level components and listen for user level rules to be registered.
     * After we register user level rules it will load application.oss.
     *
     *
     * @param {?} sysReferences
     * @return {?}
     */
    registerComponents(sysReferences) {
        assert(isPresent(this.injector), 'Cannot register components without Injector in order' +
            ' to get access to ComponentRegistry Service');
        assert(this.env.inTest || isPresent(this.appConfig.get(UIMeta.AppConfigUserRulesParam)), 'Unable to initialize MetaUI as user rules are missing. please use:' +
            ' metaui.rules.user-rules configuration param');
        this.componentRegistry = this.injector.get(ComponentRegistry);
        if (isPresent(this.componentRegistry)) {
            this.componentRegistry.registerTypes(sysReferences);
            if (!this.env.inTest) {
                let /** @type {?} */ userReferences = this.appConfig.get(UIMeta.AppConfigUserRulesParam);
                for (let /** @type {?} */ uRule of userReferences) {
                    this.componentRegistry.registerTypes(uRule);
                }
                this.loadApplicationRules();
            }
        }
        else if (!this.env.inTest) {
            warn('UIMeta.registerComponents() No components were registered !');
        }
    }
    /**
     *
     * Just need to call it different than the other fireAction as I can not do any method
     * overloading here.
     *
     * @param {?} action
     * @param {?} context
     * @return {?}
     */
    fireActionFromProps(action, context) {
        context.push();
        let /** @type {?} */ actionCategory = action.properties.get(ObjectMeta.KeyActionCategory);
        if (isBlank(actionCategory)) {
            actionCategory = ObjectMeta.DefaultActionCategory;
        }
        context.set(ObjectMeta.KeyActionCategory, actionCategory);
        context.set(ObjectMeta.KeyAction, action.name);
        this._fireAction(context, false);
        context.pop();
    }
    /**
     * @param {?} context
     * @param {?=} withBackAction
     * @return {?}
     */
    fireAction(context, withBackAction = false) {
        context.push();
        this._fireAction(context, withBackAction);
        context.pop();
    }
    /**
     * @param {?} context
     * @param {?} withBackAction
     * @return {?}
     */
    _fireAction(context, withBackAction) {
        let /** @type {?} */ actionResults = context.propertyForKey('actionResults');
        if (isBlank(actionResults) || !this.isRoute(actionResults)) {
            return;
        }
        this.naviateToPage(context, actionResults, withBackAction);
    }
    /**
     * @param {?} context
     * @param {?} route
     * @param {?} withBackAction
     * @return {?}
     */
    naviateToPage(context, route, withBackAction) {
        let /** @type {?} */ params = this.prepareRoute(context, withBackAction);
        let /** @type {?} */ uiContex = /** @type {?} */ (context);
        this.routingService.navigateWithRoute(route, params, uiContex.object);
    }
    /**
     * @param {?} context
     * @param {?} withBackAction
     * @return {?}
     */
    prepareRoute(context, withBackAction) {
        let /** @type {?} */ params = {};
        let /** @type {?} */ pageBindings = context.propertyForKey('pageBindings');
        if (isPresent(pageBindings)) {
            pageBindings.forEach((v, k) => {
                if (k !== ObjectMeta.KeyObject) {
                    (/** @type {?} */ (params))[k] = context.resolveValue(v);
                }
            });
            if (isPresent(withBackAction)) {
                (/** @type {?} */ (params))['b'] = withBackAction;
            }
        }
        return params;
    }
    /**
     * @param {?} component
     * @param {?} context
     * @param {?} withBackAction
     * @return {?}
     */
    prepareRouteForComponent(component, context, withBackAction) {
        let /** @type {?} */ params = {};
        let /** @type {?} */ pageBindings = context.propertyForKey('pageBindings');
        if (isPresent(pageBindings)) {
            pageBindings.forEach((v, k) => {
                component[k] = v;
            });
        }
        return params;
    }
    /**
     * @param {?} module
     * @param {?=} activatedPath
     * @return {?}
     */
    gotoModule(module, activatedPath) {
        this.env.deleteValue(ACTIVE_CNTX);
        let /** @type {?} */ context = this.newContext();
        context.push();
        context.set(UIMeta.KeyModule, module.name);
        let /** @type {?} */ pageName = context.propertyForKey(UIMeta.KeyHomePage);
        let /** @type {?} */ route = this.routingService.routeForPage(pageName, module.name.toLowerCase(), activatedPath);
        if (activatedPath === '/') {
            activatedPath = '';
        }
        let /** @type {?} */ path = `${activatedPath}/${route.path}`;
        let /** @type {?} */ params = this.prepareRoute(context, null);
        context.pop();
        this.routingService.navigate([path, params], { skipLocationChange: true });
    }
    /**
     * @param {?} actionResult
     * @return {?}
     */
    isRoute(actionResult) {
        return isStringMap(actionResult) && isPresent(actionResult['path']);
    }
    /**
     * @param {?} name
     * @return {?}
     */
    compPageWithName(name) {
        let /** @type {?} */ currType = this.componentRegistry.nameToType.get(name);
        if (isBlank(currType)) {
            assert(false, name + ' component does not exists. Create Dummy Component instead of' +
                ' throwing this error');
            return;
        }
        return currType;
    }
    /**
     * @param {?} context
     * @param {?} result
     * @param {?} zones
     * @return {?}
     */
    actionsByCategory(context, result, zones) {
        let /** @type {?} */ catNames = [];
        let /** @type {?} */ actionCategories = this.itemList(context, ObjectMeta.KeyActionCategory, zones);
        if (isPresent(actionCategories)) {
            actionCategories.forEach((item) => catNames.push(item.name));
        }
        this.addActionsForCategories(context, result, catNames);
        return actionCategories;
    }
    /**
     * @param {?} context
     * @param {?} result
     * @param {?} catNames
     * @return {?}
     */
    addActionsForCategories(context, result, catNames) {
        for (let /** @type {?} */ cat of catNames) {
            context.push();
            if (cat !== ObjectMeta.DefaultActionCategory) {
                context.set(ObjectMeta.KeyActionCategory, cat);
            }
            this.collectActionsByCategory(context, result, cat);
            context.pop();
        }
    }
    /**
     * @param {?} context
     * @param {?} result
     * @param {?} targetCat
     * @return {?}
     */
    collectActionsByCategory(context, result, targetCat) {
        let /** @type {?} */ actionInfos = this.itemProperties(context, ObjectMeta.KeyAction, true);
        for (let /** @type {?} */ actionInfo of actionInfos) {
            context.push();
            context.set(ObjectMeta.KeyAction, actionInfo.name);
            let /** @type {?} */ visible = context.booleanPropertyForKey(ObjectMeta.KeyVisible, true);
            context.pop();
            if (visible) {
                let /** @type {?} */ category = actionInfo.properties.get(ObjectMeta.KeyActionCategory);
                if (category == null) {
                    category = ObjectMeta.DefaultActionCategory;
                }
                if (targetCat !== category) {
                    continue;
                }
                let /** @type {?} */ forCategory = result.get(category);
                if (isBlank(forCategory)) {
                    forCategory = [];
                    result.set(category, forCategory);
                }
                forCategory.push(actionInfo);
            }
        }
    }
    /**
     * @param {?=} context
     * @param {?=} checkVisibility
     * @return {?}
     */
    computeModuleInfo(context = this.newContext(), checkVisibility = true) {
        let /** @type {?} */ moduleInfo = new ModuleInfo();
        moduleInfo.modules = [];
        let /** @type {?} */ allModuleProps = this.itemList(context, UIMeta.KeyModule, UIMeta.ActionZones);
        moduleInfo.moduleNames = [];
        moduleInfo.moduleByNames = new Map();
        for (let /** @type {?} */ module of allModuleProps) {
            context.push();
            context.set(UIMeta.KeyModule, module.name);
            if (checkVisibility && !context.booleanPropertyForKey(UIMeta.KeyVisible, true)) {
                context.pop();
                continue;
            }
            moduleInfo.moduleNames.push(module.name);
            // // todo: create typescript anotation
            // context.push();
            // context.set("homeForClasses", true);
            // let homeClasses: Array<string> = this.itemNames(context, UIMeta.KeyClass);
            // context.pop();
            let /** @type {?} */ modProperties = new ItemProperties(module.name, context.allProperties(), false);
            moduleInfo.modules.push(modProperties);
            moduleInfo.moduleByNames.set(module.name, modProperties);
            context.pop();
        }
        context.push();
        context.set(UIMeta.KeyModule, moduleInfo.moduleNames);
        moduleInfo.actionsByCategory = new Map();
        moduleInfo.actionCategories = this.actionsByCategory(context, moduleInfo.actionsByCategory, UIMeta.ModuleActionZones);
        context.pop();
        return moduleInfo;
    }
    /**
     * @param {?} moduleName
     * @param {?=} context
     * @return {?}
     */
    currentModuleLabel(moduleName, context = this.newContext()) {
        context.push();
        context.set(UIMeta.KeyModule, moduleName);
        let /** @type {?} */ label = context.propertyForKey(UIMeta.KeyLabel);
        context.pop();
        return label;
    }
}
UIMeta.KeyOperation = 'operation';
UIMeta.KeyModule = 'module';
UIMeta.KeyLayout = 'layout';
UIMeta.KeyArea = 'area';
UIMeta.KeyEditing = 'editing';
UIMeta.KeyAfter = 'after';
UIMeta.KeyHidden = 'hidden';
UIMeta.KeyLabel = 'label';
UIMeta.KeyComponentName = 'component';
UIMeta.KeyBindings = 'bindings';
UIMeta.KeyHomePage = 'homePage';
UIMeta.KeyZonePath = 'zonePath';
UIMeta.PropFieldsByZone = 'fieldsByZone';
UIMeta.PropIsFieldsByZone = 'fiveZoneLayout';
UIMeta.PropActionsByCategory = 'actionsByCategory';
UIMeta.PropActionCategories = 'actionCategories';
UIMeta.PropFieldPropertyList = 'fieldPropertyList';
UIMeta.PropLayoutsByZone = 'layoutsByZone';
UIMeta.KeyWrapperComponent = 'wrapperComponent';
UIMeta.KeyWrapperBinding = 'wrapperBindings';
UIMeta.RootPredecessorKey = '_root';
UIMeta.ZoneMain = 'zMain';
UIMeta.ZoneTop = 'zTop';
UIMeta.ZoneLeft = 'zLeft';
UIMeta.ZoneMiddle = 'zMiddle';
UIMeta.ZoneRight = 'zRight';
UIMeta.ZoneBottom = 'zBottom';
UIMeta.ZoneDetail = 'zDetail';
UIMeta.AppConfigRuleFilesParam = 'metaui.rules.file-names';
UIMeta.AppConfigUserRulesParam = 'metaui.rules.user-rules';
UIMeta.ZonesTLRMB = [
    UIMeta.ZoneTop, UIMeta.ZoneLeft, UIMeta.ZoneMiddle,
    UIMeta.ZoneRight, UIMeta.ZoneBottom
];
UIMeta.ZonesMTLRB = [
    UIMeta.ZoneMain, UIMeta.ZoneTop, UIMeta.ZoneLeft, UIMeta.ZoneRight, UIMeta.ZoneBottom
];
UIMeta.ZonesDetail = [UIMeta.ZoneDetail];
UIMeta._instance = null;
UIMeta.ModuleActionZones = ['zNav', 'zGlobal'];
UIMeta.ActionZones = ['zGlobal', 'zMain', 'zGeneral'];
class ModuleInfo {
}
class LocalizedString extends DynamicPropertyValue {
    /**
     * @param {?} meta
     * @param {?} _module
     * @param {?} _key
     * @param {?} _defaultValue
     */
    constructor(meta, _module, _key, _defaultValue) {
        super();
        this.meta = meta;
        this._module = _module;
        this._key = _key;
        this._defaultValue = _defaultValue;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        // let clazz = context.values.get('class');
        // if (isPresent(this._key) && isPresent(this.meta.i18nService)) {
        //     let i18nKey = clazz + '.' + this._key;
        //     localizedString = this.meta.i18nService.instant(i18nKey);
        //
        //     // when it return the same string most likely it means there is no
        //     // translation so default it to null
        //     localizedString = (localizedString === i18nKey) ? null : localizedString;
        // }
        // if (isBlank(localizedString) || this._key === ObjectMeta.KeyField) {
        //     return this._defaultValue;
        // }
        return this._defaultValue;
    }
    /**
     * @return {?}
     */
    toString() {
        return 'LocaledString: {' + this._key + ' - ' + this._defaultValue + ' }';
    }
}
class LocalizedLabelString extends LocalizedString {
    /**
     * @param {?} meta
     */
    constructor(meta) {
        super(meta, LocalizedLabelString.DefaultModule, null, null);
        this.meta = meta;
        this.propertyAwaking = true;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        if (isBlank(this._key)) {
            let /** @type {?} */ scopeKey = context.values.get(Meta.ScopeKey);
            let /** @type {?} */ scopeVal = context.values.get(scopeKey);
            this._defaultValue = UIMeta.defaultLabelForIdentifier(scopeVal);
            this._key = scopeKey;
        }
        return super.evaluate(context);
    }
    /**
     * @param {?} map
     * @return {?}
     */
    awakeForPropertyMap(map) {
        return new LocalizedLabelString(this.meta);
    }
}
LocalizedLabelString.DefaultModule = 'default';
class PropFieldsByZoneResolver extends StaticallyResolvable {
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        let /** @type {?} */ m = (/** @type {?} */ (context.meta)).itemNamesByZones(context, UIMeta.KeyField, (/** @type {?} */ (context.meta)).zones(context));
        let /** @type {?} */ zonePath = (/** @type {?} */ (context.meta)).zonePath(context);
        if (isPresent(zonePath)) {
            m = /** @type {?} */ (FieldPath.getFieldValue(m, zonePath));
            if (isBlank(m)) {
                m = new Map();
            }
        }
        return m;
    }
}
class PropFieldPropertyListResolver extends StaticallyResolvable {
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        return (/** @type {?} */ (context.meta)).fieldList(context);
    }
}
class PropLayoutsByZoneResolver extends StaticallyResolvable {
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        return (/** @type {?} */ (context.meta)).itemNamesByZones(context, UIMeta.KeyLayout, (/** @type {?} */ (context.meta)).zones(context));
    }
}
class _DefaultLabelGenerator extends StaticallyResolvable {
    /**
     * @param {?} _key
     */
    constructor(_key) {
        super();
        this._key = _key;
    }
    /**
     * @param {?} context
     * @return {?}
     */
    evaluate(context) {
        let /** @type {?} */ fieldName = context.values.get(this._key);
        return (isPresent(fieldName) && isString(fieldName)) ?
            UIMeta.defaultLabelForIdentifier(fieldName) : null;
    }
}
/**
 * Load User defined meta data. This class is triggered as soon as we create a context and
 * pass an object into it. Based on the object we notify different Observers passing name
 * of the class and here we search if we have any Rules available for current className and
 * try to load the Rule.
 */
class UserMetaDataProvider {
    /**
     * @param {?} meta
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    notify(meta, key, value) {
        let /** @type {?} */ aRules;
        let /** @type {?} */ uiMeta = /** @type {?} */ (meta);
        if (uiMeta._testRules.has(value + 'Rule')) {
            // since we are in development mode and test mode is on we can check extra repository
            // used by tests, we need to check if we are not running unittest and a class is not
            // application defined but unittest defined rule
            if (uiMeta._testRules.has(value + 'Rule') &&
                isPresent(uiMeta._testRules.get(value + 'Rule').oss)) {
                aRules = uiMeta._testRules.get(value + 'Rule').oss;
            }
            meta.loadUserRule(aRules, value);
        }
        else if (isPresent(uiMeta.appConfig) &&
            uiMeta.appConfig.get(UIMeta.AppConfigUserRulesParam)) {
            let /** @type {?} */ userReferences = uiMeta.appConfig.get(UIMeta.AppConfigUserRulesParam);
            for (let /** @type {?} */ i in userReferences) {
                if (isPresent(userReferences[i][value + 'Rule']) &&
                    isPresent(userReferences[i][value + 'Rule'].oss)) {
                    aRules = userReferences[i][value + 'Rule'].oss;
                }
            }
            meta.loadUserRule(aRules, value);
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Constant represent current active and mainly latest Context
 *
 */
const /** @type {?} */ ACTIVE_CNTX = 'CurrentMC';
// define set of properties which will be skipped as they are defined as inputs or  added by
// angular
const /** @type {?} */ IMPLICIT_PROPERTIES = [
    'module', 'layout', 'operation', 'class', 'object', 'actionCategory', 'action', 'field',
    'pushNewContext'
];
const /** @type {?} */ IMMUTABLE_PROPERTIES = [
    'module', 'layout', 'operation', 'class', 'action', 'field', 'pushNewContext'
];
class MetaContextComponent extends BaseFormComponent {
    /**
     * @param {?} elementRef
     * @param {?} env
     * @param {?} parentContainer
     */
    constructor(elementRef, env, parentContainer) {
        super(env, null);
        this.elementRef = elementRef;
        this.env = env;
        this.parentContainer = parentContainer;
        this.beforeContextSet = new EventEmitter();
        this.onContextChanged = new EventEmitter();
        this.afterContextSet = new EventEmitter();
        this.onAction = new EventEmitter();
        /**
         * Flag that tells us that component is fully rendered
         *
         */
        this.viewInitialized = false;
        /**
         *
         * Marks MetaContext or the root MetaContext that created a new Context
         *
         */
        this.contextCreated = false;
        this.bindingKeys = [];
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.initBindings();
        this.hasObject = this._hasObject();
        // MetaContextComponent.stackDepth++;
        // console.log(this.indent() + '=> ngOnInit:', this.contextKey());
        // Initial push, when component is first initialized the rest is done based on changes.
        this.pushPop(true);
        if (!this.env.hasValue('parent-cnx')) {
            this.env.setValue('parent-cnx', this);
        }
    }
    /**
     * For any other immutable object detect changes here and refresh the context stack
     *
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        // console.log(this.indent() + '    => ngOnChanges', this.contextKey());
        for (let /** @type {?} */ name of IMMUTABLE_PROPERTIES) {
            if (isPresent(changes[name])
                && (changes[name].currentValue !== changes[name].previousValue)) {
                this.initBindings();
                break;
            }
        }
        // in case object is coming late e.g. from some reactive API like REST then we
        // do not get it into ngInit but it will be here.
        if (this.viewInitialized && isPresent(changes['object']) && isPresent(this.object)) {
            this.initBindings();
        }
    }
    /**
     * Ng check is trigged after view is fully inialized and we want to push everything new
     * properties to the context and evaluate everything.
     *
     *
     * @return {?}
     */
    ngDoCheck() {
        if (this.viewInitialized) {
            this.hasObject = this._hasObject();
            // MetaContextComponent.stackDepth++;
            this.pushPop(true);
            // console.log(this.indent() + '=> ngDoCheck(CHANGED)', this.contextKey());
            if (isPresent(this.object) && !equals(this.prevObject, this.object)) {
                this.updateModel();
            }
        }
    }
    /**
     * We want to start detecting changes only after view is fully checked
     * @return {?}
     */
    ngAfterViewInit() {
        if (!this.viewInitialized) {
            // console.log(this.indent() + '=> ngAfterViewInit:', this.contextKey());
            // MetaContextComponent.stackDepth--;
            this.pushPop(false);
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewChecked() {
        if (this.viewInitialized) {
            // console.log(this.indent() + '=> ngAfterViewChecked:', this.contextKey());
            // MetaContextComponent.stackDepth--;
            this.pushPop(false);
        }
        else {
            this.viewInitialized = true;
        }
    }
    /**
     *
     * This is our key method that triggers all the interaction inside MetaUI world. Here we
     * push context keys and their values to the stack and this is the thing that triggers
     * rule recalculation which give us updated  properties. Those are then used by
     * MetaIncludeComponent to render the UI.
     *
     * myContext is current context for this MetaContext Component.
     *
     * @param {?} isPush identifies if we are pushing or popping to context stack
     * @return {?}
     */
    pushPop(isPush) {
        // console.log(this.indent() + '=> pushPop: isPush' + isPush, this.contextKey());
        let /** @type {?} */ activeContext = this.activeContext();
        assert(isPush || isPresent(activeContext), 'pop(): Missing context');
        let /** @type {?} */ forceCreate = isPush && (isPresent(this.pushNewContext) && this.pushNewContext);
        if (isBlank(activeContext) || forceCreate) {
            let /** @type {?} */ metaUI = UIMeta.getInstance();
            activeContext = metaUI.newContext(forceCreate);
            this.contextCreated = true;
            this.env.push(ACTIVE_CNTX, activeContext);
        }
        if (isPush) {
            activeContext.push();
            if (isPresent(this._scopeBinding) && this.hasObject) {
                this.beforeContextSet.emit(this._scopeBinding);
                activeContext.setScopeKey(this._scopeBinding);
                this.afterContextSet.emit(this._scopeBinding);
            }
            else {
                for (let /** @type {?} */ index = 0; index < this.bindingKeys.length; index++) {
                    let /** @type {?} */ key = this.bindingKeys[index];
                    let /** @type {?} */ value = this.bindingsMap.get(key);
                    this.beforeContextSet.emit(value);
                    activeContext.set(key, value);
                    this.afterContextSet.emit(value);
                }
            }
            // Save created content to local MetaContext
            this._myContext = activeContext.snapshot().hydrate(false);
        }
        else {
            activeContext.pop();
            if (this.contextCreated) {
                this.env.pop(ACTIVE_CNTX);
            }
        }
    }
    /**
     * Just for troubleshooting to print current context and assignments
     *
     * @return {?}
     */
    debugString() {
        if (isPresent(this._myContext)) {
            return this._myContext.debugString();
        }
    }
    /**
     *
     * Every meta context component which pushing certain properties to stack has its own context
     * that lives until component is destroyed
     *
     * @return {?}
     */
    myContext() {
        return this._myContext;
        // let cnxKey = this.contextKey();
        // return this.env.getValue(cnxKey);
    }
    /**
     * We keep the most current and latest context to environment to be read by any Child
     * MetaContext for purpose of creation new context and it needs info what was already pushed
     * onto the stack.
     *
     * @return {?}
     */
    activeContext() {
        return this.env.peak(ACTIVE_CNTX);
    }
    /**
     * Let's clean up and destroy pushed context
     * @return {?}
     */
    ngOnDestroy() {
        if (this.env.hasValue('parent-cnx')) {
            this.env.deleteValue('parent-cnx');
        }
    }
    /**
     * Ideally we do not need this method if Angular would support to pass variable number of
     * bindings without a need to have backup property for each of the bindings or expression./
     *
     * Once they support. we can remove this. Since this check what are known bindings passed,
     * meaning the ones decorated with \@Input and the rest
     *
     * @return {?}
     */
    initBindings() {
        this.bindingsMap = new Map();
        let /** @type {?} */ nativeElement = this.elementRef.nativeElement;
        this.initImplicitBindings();
        for (let /** @type {?} */ i = 0; i < nativeElement.attributes.length; i++) {
            let /** @type {?} */ attr = nativeElement.attributes.item(i);
            if (this.ignoreBinding(attr)) {
                continue;
            }
            if (isPresent(attr.name) && attr.name.toLowerCase() === 'scopekey') {
                this._scopeBinding = attr.value;
            }
            else {
                this.bindingsMap.set(attr.name, attr.value);
            }
        }
        this.bindingKeys = [];
        this.bindingsMap.forEach((value, key) => {
            this.bindingKeys.push(key);
        });
        // Sort them by their importance or rank
        ListWrapper.sortByExample(this.bindingKeys, IMPLICIT_PROPERTIES);
    }
    /**
     * The thing we want is to pass variable number of bindings and resolve them programmatically.
     * Currently in Angular we cannot do this we have these set of properties where we expect
     * some expression, some dynamic properties. For the rest we expect only string literal to be
     * passed in therefore we can resolve them with nativeElement.attributes
     *
     * @return {?}
     */
    initImplicitBindings() {
        if (isPresent(this.module)) {
            this.bindingsMap.set('module', this.module);
        }
        if (isPresent(this.layout)) {
            this.bindingsMap.set('layout', this.layout);
        }
        if (isPresent(this.operation)) {
            this.bindingsMap.set('operation', this.operation);
        }
        if (isPresent(this.class)) {
            this.bindingsMap.set('class', this.class);
        }
        if (isPresent(this.object)) {
            this.bindingsMap.set('object', this.object);
            this.prevObject = Object.assign({}, this.object);
        }
        if (isPresent(this.actionCategory)) {
            this.bindingsMap.set('actionCategory', this.actionCategory);
        }
        if (isPresent(this.action)) {
            this.bindingsMap.set('action', this.action);
        }
        if (isPresent(this.field)) {
            this.bindingsMap.set('field', this.field);
        }
    }
    /**
     *
     * Since we are going thru the element' attributes we want to skip anything that has nothign
     * to do with us.
     *
     * @param {?} attr
     * @return {?}
     */
    ignoreBinding(attr) {
        return IMPLICIT_PROPERTIES.indexOf(attr.name) !== -1 ||
            StringWrapper.contains(attr.name, '_ng') ||
            StringWrapper.contains(attr.name, 'ng-') ||
            StringWrapper.contains(attr.name, '(') ||
            (isBlank(attr.value) || attr.value.length === 0);
    }
    /**
     * If object is changed we need to also update our angular model to reflect user changes. All
     * changes and updates in metaui use object references
     * @return {?}
     */
    updateModel() {
        let /** @type {?} */ fields = Object.keys(this.object);
        fields.forEach((field) => {
            let /** @type {?} */ control = /** @type {?} */ (this.formGroup.get(field));
            if (isPresent(control)) {
                control.patchValue(this.object[field], { onlySelf: false, emitEvent: true });
            }
        });
        this.prevObject = Object.assign({}, this.object);
    }
    /**
     * @return {?}
     */
    _hasObject() {
        let /** @type {?} */ context = this.activeContext();
        if (isPresent(context)) {
            return isPresent((/** @type {?} */ (context)).object);
        }
        return false;
    }
}
MetaContextComponent.decorators = [
    { type: Component, args: [{
                selector: 'm-context',
                template: '<ng-content></ng-content>',
                changeDetection: ChangeDetectionStrategy.OnPush,
                providers: [
                    { provide: BaseFormComponent, useExisting: forwardRef(() => MetaContextComponent) }
                ]
            },] },
];
/** @nocollapse */
MetaContextComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: Environment },
    { type: BaseFormComponent, decorators: [{ type: SkipSelf }, { type: Optional }, { type: Inject, args: [forwardRef(() => BaseFormComponent),] }] }
];
MetaContextComponent.propDecorators = {
    module: [{ type: Input }],
    layout: [{ type: Input }],
    operation: [{ type: Input }],
    class: [{ type: Input }],
    object: [{ type: Input }],
    actionCategory: [{ type: Input }],
    action: [{ type: Input }],
    field: [{ type: Input }],
    pushNewContext: [{ type: Input }],
    beforeContextSet: [{ type: Output }],
    onContextChanged: [{ type: Output }],
    afterContextSet: [{ type: Output }],
    onAction: [{ type: Output }]
};
/**
 *
 * Defines format for the broadcasted action event. MetaUI can also execute actions which needs to
 * be handled by application or actual component using this m-context.
 *
 */
class MetaUIActionEvent {
    /**
     * @param {?} component
     * @param {?} eventName
     * @param {?} cnxName
     * @param {?} data
     */
    constructor(component, eventName, cnxName, data) {
        this.component = component;
        this.eventName = eventName;
        this.cnxName = cnxName;
        this.data = data;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class AWMetaCoreModule {
}
AWMetaCoreModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    MetaContextComponent
                ],
                imports: [
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule
                ],
                entryComponents: [
                    MetaContextComponent
                ],
                exports: [
                    MetaContextComponent,
                    ReactiveFormsModule,
                    FormsModule
                ],
                providers: []
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class RuleLoaderService {
    constructor() {
    }
    /**
     * @return {?}
     */
    get uiMeta() {
        return this._uiMeta;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set uiMeta(value) {
        this._uiMeta = value;
    }
    /**
     * @param {?} meta
     * @param {?} source
     * @param {?} module
     * @param {?} onRule
     * @return {?}
     */
    loadRules(meta, source, module, onRule) {
        this._uiMeta = /** @type {?} */ (meta);
        source.forEach((val, index) => {
            let /** @type {?} */ rule = this.readRule(val, module);
            if (isPresent(onRule)) {
                onRule(rule);
            }
        });
    }
    /**
     * @param {?} source
     * @param {?} module
     * @return {?}
     */
    loadRulesWithReturn(source, module) {
        let /** @type {?} */ rules = new Array();
        source.forEach((val, index) => {
            let /** @type {?} */ rule = this.readRule(val, module);
            rules.push(rule);
        });
        return rules;
    }
    /**
     * @param {?} jsonRule
     * @param {?} module
     * @return {?}
     */
    readRule(jsonRule, module) {
        let /** @type {?} */ selectors = new Array();
        for (let /** @type {?} */ item of jsonRule._selectors) {
            if (isPresent(item._value) && item._value.constructor === Object && Object.keys(item._value).length === 0) {
                item._value = Meta.NullMarker;
            }
            let /** @type {?} */ selector = new Selector(item._key, item._value, item._isDecl);
            selectors.push(selector);
        }
        let /** @type {?} */ properties = MapWrapper.createFromStringMapWithResolve(jsonRule._properties, (k, v) => {
            if (isStringMap(v) &&
                isPresent(v['t'])) {
                return this.resoveValue(v['t'], v, module);
            }
            else if (isStringMap(v) && !isArray(v)) {
                // we have some
                // other sub level
                // of object
                // literal - lets
                // convert this
                // into Map.
                return MapWrapper.createFromStringMapWithResolve(v, (key, val) => this.resoveValue(val['t'], val, module));
            }
            else if (isArray(v)) {
                // let convert with
                // typings as well
                return ListWrapper.clone(v);
            }
            return v;
        });
        let /** @type {?} */ props = properties.size === 0 ? undefined : properties;
        let /** @type {?} */ rule = new Rule(selectors, props, jsonRule._rank);
        return rule;
    }
    /**
     * @param {?} type
     * @param {?} value
     * @param {?} module
     * @return {?}
     */
    resoveValue(type, value, module) {
        if (isBlank(value)) {
            return null;
        }
        if (type === 'Expr') {
            return new Expr(value['v']);
        }
        else if (type === 'SDW') {
            let /** @type {?} */ expr = new Expr(value['v']);
            return new StaticDynamicWrapper(new StaticallyResolvableWrapper(expr));
        }
        else if (type === 'CFP') {
            return new ContextFieldPath(value['v']);
        }
        else if (type === 'OV') {
            return new OverrideValue(value['v']);
        }
        else if (type === 'i18n' && value['v']['key']) {
            let /** @type {?} */ locKey = value['v']['key'];
            return isPresent(this._uiMeta) ? this._uiMeta.createLocalizedString(locKey, value['v']['defVal'])
                :
                    new LocalizedString(null, module, locKey, value['v']['defVal']);
        }
        return value;
    }
}
RuleLoaderService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
RuleLoaderService.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class NoMetaComponent {
    constructor() {
    }
    /**
     * @return {?}
     */
    ngOnInit() {
    }
}
NoMetaComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-no-meta',
                template: `
        <h2>MetaIncludeComponentDirective Error:</h2>
                No componentName property resolved in Context<br/>
    `,
                styles: [``]
            },] },
];
/** @nocollapse */
NoMetaComponent.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 *  MetaIncludeComponentDirective is (along with MetaContext) the key element for binding MetaUI
 * into AngularJs user interfaces. You can think of it such GLUE.
 *
 *  MetaIncludeComponentDirective dynamically switches in a Angular's component based on the
 * current MetaContext's
 * 'component' property and sets its bindings from the 'bindings' property.  This alone enables
 * almost any existing Angular's widget to be specified for use for a particular field or layout
 * using rules -- without any additional glue code .
 *
 *  component using 'wrapperComponent' and 'wrapperBindings', binding component content using the
 * bindings 'ngcontent', ngcontentLayout and 'ngcontentelElement', and event binding named Content
 * templates using an
 * 'awcontentLayouts' map binding. Without this we will not be able to use complex layouts.
 *
 */
class MetaIncludeComponentDirective extends IncludeComponentDirective {
    /**
     * @param {?} metaContext
     * @param {?} viewContainer
     * @param {?} factoryResolver
     * @param {?} env
     * @param {?} cd
     * @param {?} compRegistry
     * @param {?} domUtils
     */
    constructor(metaContext, viewContainer, factoryResolver, env, cd, compRegistry, domUtils) {
        super(viewContainer, factoryResolver, cd, compRegistry);
        this.metaContext = metaContext;
        this.viewContainer = viewContainer;
        this.factoryResolver = factoryResolver;
        this.env = env;
        this.cd = cd;
        this.compRegistry = compRegistry;
        this.domUtils = domUtils;
    }
    /**
     * First we simply render the a component in the ngOnInit() and then every time something
     * changes.
     * @return {?}
     */
    ngDoCheck() {
        // console.log('MetaInclude(ngDoCheck):', this.name);
        let /** @type {?} */ context = this.metaContext.myContext();
        if (isBlank(context) || isBlank(this.currentComponent)) {
            // console.log('No context/ component for ' + this.name);
            return;
        }
        let /** @type {?} */ newComponent = context.propertyForKey('component');
        if (isPresent(newComponent) && isPresent(this.name) && (this.name !== newComponent)) {
            this.viewContainer.clear();
            this.doRenderComponent();
            // console.log('MetaInclude(ngDoCheck- rerender ):', this.name);
            this.createWrapperElementIfAny();
            this.createContentElementIfAny();
        }
        else {
            // we might not skip component instantiation but we still need to update bindings
            // as properties could change
            let /** @type {?} */ editable = context.propertyForKey(ObjectMeta.KeyEditable);
            if (isBlank(editable)) {
                editable = context.propertyForKey(UIMeta.KeyEditing);
            }
            let /** @type {?} */ metaBindings = context.propertyForKey(UIMeta.KeyBindings);
            let /** @type {?} */ type = context.propertyForKey(ObjectMeta.KeyType);
            let /** @type {?} */ inputs = this.componentReference().metadata.inputs;
            // re-apply Inputs
            // maybe we should diff properties and only if they changed re-apply
            if (isPresent(metaBindings) && isPresent(inputs)) {
                this.applyInputs(this.currentComponent, type, metaBindings, inputs, editable);
            }
        }
    }
    /**
     * @return {?}
     */
    resolveComponentType() {
        this.name = this.metaContext.myContext().propertyForKey(UIMeta.KeyComponentName);
        if (isBlank(this.name)) {
            return NoMetaComponent;
        }
        return super.resolveComponentType();
    }
    /**
     * @return {?}
     */
    ngContent() {
        let /** @type {?} */ cntValue;
        let /** @type {?} */ bindings = this.metaContext.myContext().propertyForKey(UIMeta.KeyBindings);
        if (isPresent(bindings) &&
            isPresent(cntValue = bindings.get(IncludeComponentDirective.NgContent))) {
            cntValue = isString(cntValue) ? cntValue :
                this.metaContext.myContext().resolveValue(cntValue);
        }
        return cntValue;
    }
    /**
     * @return {?}
     */
    ngContentElement() {
        let /** @type {?} */ cntValue;
        let /** @type {?} */ bindings = this.metaContext.myContext().propertyForKey(UIMeta.KeyBindings);
        if (isPresent(bindings) &&
            isPresent(cntValue = bindings.get(IncludeComponentDirective.NgContentElement))) {
            cntValue = isString(cntValue) ? cntValue :
                this.metaContext.myContext().resolveValue(cntValue);
        }
        return cntValue;
    }
    /**
     * Implement custom behavior of adding ngcontentLayout described above (where the constant
     * is defined)
     *
     * @return {?}
     */
    createContentElementIfAny() {
        let /** @type {?} */ detectChanges = false;
        let /** @type {?} */ bindings = this.metaContext.myContext().propertyForKey(UIMeta.KeyBindings);
        if (isPresent(bindings) && bindings.has(MetaIncludeComponentDirective.NgContentLayout)) {
            let /** @type {?} */ layoutName = bindings.get(MetaIncludeComponentDirective.NgContentLayout);
            let /** @type {?} */ context = this.metaContext.myContext();
            context.push();
            context.set(UIMeta.KeyLayout, layoutName);
            let /** @type {?} */ componentName = context.propertyForKey('component');
            let /** @type {?} */ compType = this.compRegistry.nameToType.get(componentName);
            let /** @type {?} */ componentFactory = this.factoryResolver
                .resolveComponentFactory(compType);
            let /** @type {?} */ componentMeta = this.resolveDirective(componentFactory);
            let /** @type {?} */ ngComponent = this.viewContainer.createComponent(componentFactory, 0);
            let /** @type {?} */ cReference = {
                metadata: componentMeta,
                resolvedCompFactory: componentFactory,
                componentType: compType,
                componentName: componentName
            };
            this.applyBindings(cReference, ngComponent, context.propertyForKey(UIMeta.KeyBindings), false);
            this.domUtils.insertIntoParentNgContent(this.currentComponent.location.nativeElement, ngComponent.location.nativeElement);
            context.pop();
            detectChanges = true;
        }
        else {
            detectChanges = super.createContentElementIfAny();
        }
        if (detectChanges) {
            // console.log('MetaInclude(createContentElementIfAny):', this.name);
            this.cd.detectChanges();
        }
        return detectChanges;
    }
    /**
     * Meta placeTheComponent needs to account for wrapper component. If wrapper component
     * is present. It needs to inject the wrapper component on the page and add this component
     * inside the wrapper component.
     * @return {?}
     */
    createWrapperElementIfAny() {
        let /** @type {?} */ wrapperName = this.metaContext.myContext().propertyForKey(UIMeta.KeyWrapperComponent);
        if (isBlank(wrapperName)) {
            return;
        }
        // Now we have wrapperComponent. We do the following:
        // 1.  Create wrapper component.
        let /** @type {?} */ wrapperType = this.compRegistry.nameToType.get(wrapperName);
        let /** @type {?} */ componentFactory = this.factoryResolver
            .resolveComponentFactory(wrapperType);
        let /** @type {?} */ componentMeta = this.resolveDirective(wrapperType);
        let /** @type {?} */ wrapperComponent = this.viewContainer.createComponent(componentFactory);
        // 2. Add wrapper bindings to wrapper component.
        let /** @type {?} */ wrapperBindings = this.metaContext.myContext().propertyForKey(UIMeta.KeyWrapperBinding);
        (/** @type {?} */ (wrapperComponent.instance))['bindings'] = wrapperBindings;
        // 3. Apply the bindings. Get the wrapper metadata, look through it's input - output
        // bindings. and apply the wrapperBindings to these bindings.
        let /** @type {?} */ wrapperComponentRef = {
            metadata: componentMeta,
            resolvedCompFactory: componentFactory,
            componentType: wrapperType,
            componentName: wrapperName
        };
        this.applyBindings(wrapperComponentRef, wrapperComponent, wrapperBindings);
        this.domUtils.insertIntoParentNgContent(wrapperComponent.location.nativeElement, this.currentComponent.location.nativeElement);
    }
    /**
     * ApplyBindings reads the \@Inputs from ComponentMetadata and check if there exists a binding
     * coming from MetaRules. If there is we assign it to the input.
     * @param {?} cRef
     * @param {?} component
     * @param {?} bindings
     * @param {?=} bUseMetaBindings
     * @return {?}
     */
    applyBindings(cRef, component, bindings, bUseMetaBindings = true) {
        super.applyBindings(cRef, component, bindings);
        let /** @type {?} */ inputs = cRef.metadata.inputs;
        let /** @type {?} */ outputs = cRef.metadata.outputs;
        let /** @type {?} */ metaBindings = this.metaContext.myContext().propertyForKey(UIMeta.KeyBindings);
        let /** @type {?} */ editable = this.metaContext.myContext().propertyForKey(ObjectMeta.KeyEditable);
        let /** @type {?} */ type = this.metaContext.myContext().propertyForKey(ObjectMeta.KeyType);
        // There are cases where we want to use the bindings passed into this function.
        // For example, the wrapperBindings.
        if (!bUseMetaBindings) {
            metaBindings = bindings;
        }
        if (isBlank(metaBindings) || isBlank(inputs)) {
            return;
        }
        let /** @type {?} */ currenBindings = MapWrapper.clone(metaBindings);
        this.applyInputs(component, type, currenBindings, inputs, editable);
        this.applyOutputs(component, currenBindings, outputs);
    }
    /**
     * @param {?} component
     * @param {?} type
     * @param {?} bindings
     * @param {?} inputs
     * @param {?} editable
     * @param {?=} compToBeRendered
     * @return {?}
     */
    applyInputs(component, type, bindings, inputs, editable, compToBeRendered = true) {
        // propagate a field type to bindings.
        if (isPresent(type) && isPresent(component.instance.canSetType) &&
            component.instance.canSetType()) {
            bindings.set(ObjectMeta.KeyType, type);
        }
        if (isPresent(editable) && isPresent(component.instance['editable'])) {
            component.instance['editable'] = editable;
        }
        for (let /** @type {?} */ key of inputs) {
            let /** @type {?} */ publicKey = nonPrivatePrefix(key);
            let /** @type {?} */ value = bindings.get(publicKey);
            // Handle special case where we do not pass explicitly or inherit from parent @Input
            // name for the component
            if (key === 'name' && isBlank(value)) {
                value = this.metaContext.myContext().propertyForKey(ObjectMeta.KeyField);
            }
            if (this.skipInput(key, value)) {
                continue;
            }
            // compToBeRendered = only first time
            if (compToBeRendered && value instanceof ContextFieldPath) {
                this.applyDynamicInputBindings(component.instance, bindings, inputs, key, value, editable);
            }
            else if (compToBeRendered && value instanceof DynamicPropertyValue) {
                let /** @type {?} */ dynval = value;
                let /** @type {?} */ newValue = dynval.evaluate(this.metaContext.myContext());
                component.instance[publicKey] = newValue;
            }
            else {
                /**
                                 * when re-applying Inputs skip all expressions above and only work with regular
                                 * types
                                 *
                                 * set it only if it changes so it will not trigger necessary `value changed
                                 * aftter check`
                                 */
                if (!equals(component.instance[publicKey], value)) {
                    component.instance[publicKey] = value;
                }
            }
        }
        // apply Formatter that can be specified in the oss
        // temporary disabled untill angular will support runtime i18n
        // if (bindings.has(MetaIncludeComponentDirective.FormatterBinding)) {
        //     let transform = this.formatters
        //         .get(bindings.get(MetaIncludeComponentDirective.FormatterBinding));
        //     component.instance[MetaIncludeComponentDirective.FormatterBinding] = transform;
        // }
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    skipInput(key, value) {
        return isBlank(value) || key === IncludeComponentDirective.NgContent ||
            key === MetaIncludeComponentDirective.NgContentLayout;
    }
    /**
     * @param {?} component
     * @param {?} bindings
     * @param {?} outputs
     * @return {?}
     */
    applyOutputs(component, bindings, outputs) {
        for (let /** @type {?} */ key of outputs) {
            let /** @type {?} */ publicKey = nonPrivatePrefix(key);
            let /** @type {?} */ value = bindings.get(publicKey);
            if (key === IncludeComponentDirective.NgContent) {
                continue;
            }
            let /** @type {?} */ eventEmitter = component.instance[publicKey];
            if (value instanceof DynamicPropertyValue) {
                this.applyDynamicOutputBinding(eventEmitter, value, this.metaContext.myContext());
            }
            else {
                // just trigger event outside
                eventEmitter.subscribe((val) => {
                    if (this.env.hasValue('parent-cnx')) {
                        let /** @type {?} */ event = val;
                        let /** @type {?} */ cnx = this.env.getValue('parent-cnx');
                        if (!(val instanceof MetaUIActionEvent)) {
                            event = new MetaUIActionEvent(component.instance, publicKey, publicKey, val);
                        }
                        cnx.onAction.emit(event);
                    }
                });
            }
        }
    }
    /**
     * @param {?} emitter
     * @param {?} value
     * @param {?} context
     * @return {?}
     */
    applyDynamicOutputBinding(emitter, value, context) {
        emitter.asObservable().subscribe((val) => {
            let /** @type {?} */ dynval = value;
            context.resolveValue(dynval);
        });
    }
    /**
     * @param {?} me
     * @param {?} bindings
     * @param {?} inputs
     * @param {?} key
     * @param {?} value
     * @param {?} editable
     * @return {?}
     */
    applyDynamicInputBindings(me, bindings, inputs, key, value, editable) {
        let /** @type {?} */ publicKey = nonPrivatePrefix(key);
        let /** @type {?} */ cnxtPath = value;
        let /** @type {?} */ metaContext = this.metaContext;
        /**
                 * captured also current context snapshot so we can replay ContextFieldPath.evaluate() if
                 * called outside of push/pop cycle.
                 *
                 * todo: check if we can replace this with Custom value accessor
                 */
        Object.defineProperty(me, publicKey, {
            get: () => {
                let /** @type {?} */ context = this.metaContext.myContext();
                return cnxtPath.evaluate(context);
            },
            set: (val) => {
                let /** @type {?} */ context = this.metaContext.myContext();
                let /** @type {?} */ editing = context.propertyForKey(ObjectMeta.KeyEditable)
                    || context.propertyForKey(UIMeta.KeyEditing);
                if (editing && !StringWrapper.equals(val, me[publicKey])) {
                    let /** @type {?} */ type = context.propertyForKey(ObjectMeta.KeyType);
                    cnxtPath.evaluateSet(context, ValueConverter.value(type, val));
                }
            },
            enumerable: true,
            configurable: true
        });
    }
}
/**
 * Just a constant use to access Environment where we store current context for current render
 * lifecycle
 *
 */
MetaIncludeComponentDirective.FormatterBinding = 'formatter';
/**
 *
 * In metaU we can also insert into the element not only ngcontent but new instantiated
 * component which is defined by layout
 *
 * ```
 * field trait=ObjectDetail {
 * 	editable=false {
 * 		component: HoverCardComponnet;
 * 		bindings: {
 * 			ngcontentLayout: Content;
 * 			linkTitle:${properties.get("label")};
 * 		}
 * 	}
 *
 * \@layout=Content {
 * 		component: MetaContextObject;
 * 		bindings: {
 * 			object: $value;
 * 			layout:DetailLayout
 * 			operation:"view";
 * 		}
 * 	}
 * }
 * ```
 *
 */
MetaIncludeComponentDirective.NgContentLayout = 'ngcontentLayout';
MetaIncludeComponentDirective.decorators = [
    { type: Directive, args: [{
                selector: 'm-include-component'
            },] },
];
/** @nocollapse */
MetaIncludeComponentDirective.ctorParameters = () => [
    { type: MetaContextComponent, decorators: [{ type: Inject, args: [forwardRef(() => MetaContextComponent),] }] },
    { type: ViewContainerRef },
    { type: ComponentFactoryResolver },
    { type: Environment },
    { type: ChangeDetectorRef },
    { type: ComponentRegistry },
    { type: DomUtilsService }
];
MetaIncludeComponentDirective.propDecorators = {
    context: [{ type: Input }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * This is just a wrapper component around meta-form-table as we need every single context push to
 * happen before the child content start to render.
 *
 * In this case I would like to wrap wrap my content with m-context in the way:
 *
 *  <m-context scopeKey="class">
 *        <!-- lets process one zone now and four we can deal later-->
 *        <ng-template [ngIf]="isFiveZoneLayout">
 *              <aw-form-table [isEditable]="isEditable" [labelsOnTop]="labelsOnTop"
 * (onSubmit)="onSaveAction($event)">
 *                  <ng-template ngFor let-curentField [ngForOf]="zLeft()">
 *                      <m-context [field]="curentField">
 *                           <m-form-row [field]="curentField"></m-form-row>
 *                      </m-context>
 *                  </ng-template>
 *          </aw-form-table>
 *        </ng-template>
 *  </m-context>
 *
 *
 *
 */
class MetaFormComponent {
    /**
     * @param {?} environment
     */
    constructor(environment) {
        this.environment = environment;
    }
}
MetaFormComponent.decorators = [
    { type: Component, args: [{
                selector: 'm-form',
                template: `<m-context #cnx scopeKey="class">
    <!-- Dont try to render if the object is not set yet -->
    <m-form-table *ngIf="cnx.hasObject"></m-form-table>
</m-context>
`,
            },] },
];
/** @nocollapse */
MetaFormComponent.ctorParameters = () => [
    { type: Environment }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Common component to setup the context and also create context snapshot for later user.
 * @abstract
 */
class MetaBaseComponent extends BaseFormComponent {
    /**
     * @param {?} env
     * @param {?} _metaContext
     */
    constructor(env, _metaContext) {
        super(env, _metaContext);
        this.env = env;
        this._metaContext = _metaContext;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this.updateMeta();
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        this.updateMeta();
    }
    /**
     * @return {?}
     */
    ngAfterViewChecked() {
    }
    /**
     * @return {?}
     */
    updateMeta() {
        this.editing = this.context.booleanPropertyForKey(UIMeta.KeyEditing, false);
        if (this.editing) {
            this.object = this.context.values.get(ObjectMeta.KeyObject);
            this.contextSnapshot = this.context.snapshot();
        }
        this.doUpdate();
    }
    /**
     * Placeholder to be implemented by subclass. this method is triggered when we detect any
     * changes on the MetaContext
     * @return {?}
     */
    doUpdate() {
    }
    /**
     * Get the last saved context from the MetaContext component
     *
     * @return {?}
     */
    get context() {
        if (isPresent(this._metaContext) && isPresent(this._metaContext.myContext())) {
            return this._metaContext.myContext();
        }
        assert(false, 'Should always have metaContext available');
    }
    /**
     * @return {?}
     */
    isNestedContext() {
        return this.context.isNested;
    }
    /**
     * @param {?} key
     * @param {?=} defValue
     * @return {?}
     */
    properties(key, defValue = null) {
        return isPresent(this.context) ? this.context.propertyForKey(key) : defValue;
    }
    /**
     * Retrieves active context's properties
     *
     * @param {?} me
     * @param {?} key
     * @param {?=} defValue
     * @return {?}
     */
    aProperties(me, key, defValue = null) {
        let /** @type {?} */ activeContext = this._metaContext.activeContext();
        return isPresent(me) ? me.propertyForKey(key) : defValue;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * This is a wrapper around FormtTable to render data based on current MetaContext.
 */
class MetaFormTableComponent extends MetaBaseComponent {
    /**
     * Active zones passed to the FormTable.
     *
     * Note: I could not find better way without having this property. When using FormTable I dont
     * want to tell what zones are active. The form table should figure out byitself just from the
     * ng-contented sections.
     *
     * The other approach is the wrap these into component and probably better
     *
     * e.g.
     *
     * ```html
     *  <aw-form-table ...>
     *    <aw-form-zone name='top'>
     *        <aw-form-row>...</aw-form-row>
     *     <aw-form-zone>
     *
     *
     *    ...
     *  </aw-form-table ...>
     * ```
     *
     * @param {?} _context
     * @param {?} env
     */
    constructor(_context, env) {
        super(env, _context);
        this._context = _context;
        this.env = env;
    }
    /**
     * @param {?} zone
     * @return {?}
     */
    canShowZone(zone) {
        return isPresent(this.fieldsByZone) && this.fieldsByZone.has(zone);
    }
    /**
     * @return {?}
     */
    doUpdate() {
        super.doUpdate();
        this.fieldsByZone = this.context.propertyForKey(UIMeta.PropFieldsByZone);
        this.isFiveZoneLayout = this.context.propertyForKey(UIMeta.PropIsFieldsByZone);
        let /** @type {?} */ bindings = this.context.propertyForKey(UIMeta.KeyBindings);
        if (isPresent(bindings)) {
            this.showLabelsAboveControls = bindings.get('showLabelsAboveControls');
            if (isBlank(this.showLabelsAboveControls)) {
                this.showLabelsAboveControls = false;
            }
        }
        this.initForm();
    }
    /**
     * @return {?}
     */
    zLeft() {
        return this.fieldsByZone.get(UIMeta.ZoneLeft);
    }
    /**
     * @return {?}
     */
    zMiddle() {
        return this.fieldsByZone.get(UIMeta.ZoneMiddle);
    }
    /**
     * @return {?}
     */
    zRight() {
        return this.fieldsByZone.get(UIMeta.ZoneRight);
    }
    /**
     * @return {?}
     */
    zTop() {
        return this.fieldsByZone.get(UIMeta.ZoneTop);
    }
    /**
     * @return {?}
     */
    zBottom() {
        return this.fieldsByZone.get(UIMeta.ZoneBottom);
    }
    /**
     * Need to initialize FormGroup with all the available fields based on the given object. Its
     * hard to manage a state where we dynamically render different number of fields per operation.
     *
     * *
     * @return {?}
     */
    initForm() {
        if (isPresent(this.form)) {
            this.form.editable = this.editable;
        }
        let /** @type {?} */ obj = (/** @type {?} */ (this.context)).object;
        if (Object.keys(this.formGroup.value).length !== Object.keys(obj).length) {
            Object.keys(obj).forEach((key) => {
                this.doRegister(key, obj[key]);
            });
        }
    }
}
MetaFormTableComponent.decorators = [
    { type: Component, args: [{
                selector: 'm-form-table',
                template: `<ng-template [ngIf]="isFiveZoneLayout">

    <aw-form-table #metaFormTable [editable]="editing" [useFiveZone]="isFiveZoneLayout"
                   [omitPadding]="isNestedContext()"
                   [editabilityCheck]="false"
                   [labelsOnTop]="showLabelsAboveControls">


        <aw-top *ngIf="canShowZone('zTop')">
            <ng-template ngFor let-curentField [ngForOf]="zTop()">
                <m-context [field]="curentField">
                    <m-form-row [field]="curentField" [editable]="editing"
                                [initialSize]="'x-large'"></m-form-row>
                </m-context>
            </ng-template>
        </aw-top>


        <aw-left *ngIf="canShowZone('zLeft')">

            <ng-template ngFor let-curentField [ngForOf]="zLeft()">
                <m-context [field]="curentField">
                    <m-form-row [field]="curentField" [editable]="editing"></m-form-row>
                </m-context>
            </ng-template>
        </aw-left>


        <aw-middle *ngIf="canShowZone('zMiddle')">
            <ng-template ngFor let-curentField [ngForOf]="zMiddle()">
                <m-context [field]="curentField">
                    <m-form-row [field]="curentField" [editable]="editing"></m-form-row>
                </m-context>
            </ng-template>
        </aw-middle>

        <aw-right *ngIf="canShowZone('zRight')">
            <ng-template ngFor let-curentField [ngForOf]="zRight()">
                <m-context [field]="curentField">
                    <m-form-row [field]="curentField" [editable]="editing"></m-form-row>
                </m-context>
            </ng-template>
        </aw-right>


        <aw-bottom *ngIf="canShowZone('zBottom')">
            <ng-template ngFor let-curentField [ngForOf]="zBottom()">
                <m-context [field]="curentField">
                    <m-form-row [field]="curentField" [editable]="editing"
                                [initialSize]="'x-large'"></m-form-row>
                </m-context>
            </ng-template>
        </aw-bottom>
    </aw-form-table>
</ng-template>
`,
                styles: [``]
            },] },
];
/** @nocollapse */
MetaFormTableComponent.ctorParameters = () => [
    { type: MetaContextComponent, decorators: [{ type: Host }] },
    { type: Environment }
];
MetaFormTableComponent.propDecorators = {
    form: [{ type: ViewChild, args: ['metaFormTable',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Component responsible for rendering a row using MetaIncludeComponent.
 * What I am still not sure, if I want to use fully validation from MetaRule and if I cannot
 * leverage basic validation from angular.
 *
 * Meaning I might remove default valid::** rule from WidgetsRules and when its required insert
 * default Required validation from angular.
 *
 */
class MetaFormRowComponent extends MetaBaseComponent {
    /**
     * @param {?} _metaContext
     * @param {?} env
     */
    constructor(_metaContext, env) {
        super(env, _metaContext);
        this._metaContext = _metaContext;
        this.env = env;
        /**
         * There could be special cases when we are layout component that we want to extends the row
         * 100%.
         */
        this.initialSize = 'medium';
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this.validators = this.createValidators();
    }
    /**
     * @param {?} key
     * @return {?}
     */
    bindingBoolProperty(key) {
        let /** @type {?} */ bindings = this.context.propertyForKey(UIMeta.KeyBindings);
        if (isPresent(bindings) && bindings.has(key)) {
            let /** @type {?} */ value = bindings.get(key);
            return BooleanWrapper.boleanValue(value);
        }
        return false;
    }
    /**
     * @param {?} key
     * @return {?}
     */
    bindingStringProperty(key) {
        let /** @type {?} */ bindings = this.context.propertyForKey(UIMeta.KeyBindings);
        if (isPresent(bindings) && bindings.has(key)) {
            return bindings.get(key);
        }
        return null;
    }
    /**
     * @return {?}
     */
    get size() {
        let /** @type {?} */ bindings = this.context.propertyForKey(UIMeta.KeyBindings);
        if (isPresent(bindings) && bindings.has('size')) {
            return bindings.get('size');
        }
        return this.initialSize;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set size(value) {
        this.initialSize = value;
    }
    /**
     * Creates angular based Validator which for a current field executes validation rules real
     * time as use type. At the bottom of the file there is example of async validator
     *
     * @return {?}
     */
    createValidators() {
        let /** @type {?} */ that = this;
        let /** @type {?} */ metaValidator = (control) => {
            if (isPresent(Validators.required(control)) || !control.touched) {
                return null;
            }
            let /** @type {?} */ errorMsg = UIMeta.validationError(that.context);
            return isPresent(errorMsg) ? {
                'metavalid': { 'msg': errorMsg }
            } : null;
        };
        return [metaValidator];
    }
    /**
     * @return {?}
     */
    isRequired() {
        return (isPresent(this.editing) && this.context.booleanPropertyForKey('required', false));
    }
}
MetaFormRowComponent.decorators = [
    { type: Component, args: [{
                selector: 'm-form-row',
                template: `<aw-form-row
    [editable]="editable"
    [customValidators]="validators"
    [size]="size"
    [hidden]="!properties('visible')"
    [styleClass]="bindingStringProperty('styleClass')"
    [name]="properties('field')"
    [required]="isRequired()"
    [label]="properties('label')"
    [noLabelLayout]="bindingBoolProperty('useNoLabelLayout')">

    <m-include-component></m-include-component>
</aw-form-row>

`,
                styles: [``],
                providers: [
                    { provide: FormRowComponent, useExisting: forwardRef(() => MetaFormRowComponent) }
                ]
            },] },
];
/** @nocollapse */
MetaFormRowComponent.ctorParameters = () => [
    { type: MetaContextComponent, decorators: [{ type: Host }] },
    { type: Environment }
];
MetaFormRowComponent.propDecorators = {
    field: [{ type: Input }],
    initialSize: [{ type: Input }]
};
/*

 return new Promise((resolve) => {
 setTimeout (()=>{

 let context: UIContext = <UIContext> this._contextSnapshot.hydrate();
 context.value = control.value;

 let errorMsg = UIMeta.validationError(context);


 if(isPresent(errorMsg)) {
 resolve({metavalid: {msg: errorMsg}});
 } else{
 resolve(null);
 }

 }, 700);
 });


 */
// metaValid (): AsyncValidatorFn[]
// {
//     let metaValidator = (control: AbstractControl): {[key: string]: any} =>
//     {
//         return new Promise((resolve) =>
//         {
//             setTimeout(()=>
//             {
//                 let context: UIContext = <UIContext> this._contextSnapshot.hydrate();
//                 context.value = control.value;
//
//                 let errorMsg = UIMeta.validationError(context);
//
//
//                 if (isPresent(errorMsg)) {
//                     resolve({metavalid: {msg: errorMsg}});
//                 } else {
//                     resolve(null);
//                 }
//
//             } , 400);
//         });
//     };
//     return [metaValidator];
// }

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * MetaContentPage  component is used from MetaRules and universal component rendering different
 * operation modes.
 *
 *
 */
class MetaContentPageComponent {
    /**
     * @param {?} route
     * @param {?} routingService
     */
    constructor(route, routingService) {
        this.route = route;
        this.routingService = routingService;
        this.newContext = true;
        this.isInspectAction = false;
        this.okLabel = 'Back';
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.layout = this.route.snapshot.params['layout'];
        this.operation = this.route.snapshot.params['operation'];
        let /** @type {?} */ url = '/' + this.route.snapshot.url[0].toString();
        if (this.routingService.stateCacheHistory.has(url)) {
            this.object = this.routingService.stateCacheHistory.get(url);
            this.objectName = UIMeta.defaultLabelForIdentifier(this.object.constructor.name);
        }
        let /** @type {?} */ withBackAction = this.route.snapshot.params['b'];
        if (isPresent(withBackAction) && BooleanWrapper.isTrue(withBackAction)) {
            this.isInspectAction = true;
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onBack(event) {
        this.routingService.goBack();
    }
}
MetaContentPageComponent.decorators = [
    { type: Component, args: [{
                selector: 'm-content-page',
                template: `<!-- TODO: impplement dynamic title based on the operation and object as well as updates buttons-->

<m-context [pushNewContext]="newContext" [object]="object" [operation]="operation"
           [layout]="layout">

    <aw-basic-navigator (onOKAction)="onBack($event)" [okActionLabel]="okLabel"
                        [showCancelButton]="!isInspectAction">


        <div class="page-container ">
            <br/>
            <h3>{{objectName}} details:</h3>

            <m-include-component></m-include-component>
        </div>
    </aw-basic-navigator>

</m-context>
`,
                styles: [``]
            },] },
];
/** @nocollapse */
MetaContentPageComponent.ctorParameters = () => [
    { type: ActivatedRoute },
    { type: RoutingService }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * MetaLayout represent a high level rule that aggregates defined layout. When we iterate thru the
 * different layout we need to remember both current rendered context as well as ItemProperties.
 *
 *
 *
 */
class MetaLayout extends MetaBaseComponent {
    /**
     * @param {?} _metaContext
     * @param {?} env
     */
    constructor(_metaContext, env) {
        super(env, _metaContext);
        this._metaContext = _metaContext;
        this.env = env;
        /**
         * Layout definitions by its name
         *
         */
        this.nameToLayout = new Map();
        /**
         * A map linking the name of the layout to the actual context. We need this when we need
         * to access current content.
         *
         */
        this.contextMap = new Map();
    }
    /**
     * Can be called by m-content to \@Output when context properties are pushed to stack
     *
     * @param {?} layoutName
     * @return {?}
     */
    afterContextSet(layoutName) {
        this.layoutContext = this.activeContext;
        this.contextMap.set(layoutName, this.layoutContext.snapshot().hydrate(false));
    }
    /**
     * Can be called by m-content to \@Output after context properties are pushed to stack
     *
     * @param {?} layoutName
     * @return {?}
     */
    beforeContextSet(layoutName) {
        this.layout = this.nameToLayout.get(layoutName);
    }
    /**
     * @return {?}
     */
    get activeContext() {
        return this._metaContext.activeContext();
    }
    /**
     * Retrieves all available and active layouts for zones defined by subclasses
     *
     * @return {?}
     */
    get allLayouts() {
        if (isBlank(this._allLayouts)) {
            let /** @type {?} */ meta = /** @type {?} */ (this.activeContext.meta);
            this._allLayouts = meta.itemList(this.activeContext, UIMeta.KeyLayout, this.zones());
            this.nameToLayout.clear();
            this._allLayouts.forEach((item) => this.nameToLayout.set(item.name, item));
        }
        return this._allLayouts;
    }
    /**
     * Retrieves all available and active layouts and aggregate them their name
     *
     * @return {?}
     */
    get layoutsByZones() {
        if (isBlank(this._layoutsByZones)) {
            let /** @type {?} */ meta = /** @type {?} */ (this.activeContext.meta);
            this._layoutsByZones = meta.itemsByZones(this.activeContext, UIMeta.KeyLayout, this.zones());
        }
        return this._layoutsByZones;
    }
    /**
     * @return {?}
     */
    get layout() {
        return this._layout;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set layout(value) {
        this._layout = value;
        this._propertyMap = null;
    }
    /**
     * @return {?}
     */
    get propertyMap() {
        if (isBlank(this._propertyMap)) {
            this.activeContext.push();
            this._propertyMap = this.activeContext.allProperties();
            this.activeContext.pop();
        }
        return this._propertyMap;
    }
    /**
     * @return {?}
     */
    label() {
        return this.activeContext.resolveValue(this.propertyMap.get(UIMeta.KeyLabel));
    }
    /**
     * @param {?} name
     * @return {?}
     */
    labelForContext(name) {
        let /** @type {?} */ context = this.contextMap.get(name);
        return super.aProperties(context, UIMeta.KeyLabel);
    }
    /**
     * @return {?}
     */
    zones() {
        return UIMeta.ZonesTLRMB;
    }
    /**
     * @param {?} key
     * @param {?=} defValue
     * @return {?}
     */
    properties(key, defValue = null) {
        return isPresent(this.activeContext) ? this.activeContext.propertyForKey(key) : defValue;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    debugString(name) {
        let /** @type {?} */ context = this.contextMap.get(name);
        assert(isPresent(context), 'Trying to retrive debugString on non-existing context');
        return context.debugString();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.layoutContext = null;
        this.contextMap.clear();
        this.contextMap = null;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * MetaElementList is implementation of Stack Layout where the content is rendered as list (stacked)
 * You do not use this layout directly as it is instantiated dynamically using MetaIncludeComponent.
 *
 * For more detail please checkout WidgetRules.oss the part bellow where create new trait
 * that can be applied to any layout.
 *
 * ```
 *
 * layout {
 *
 * \@trait=Stack { visible:true; component:MetaElementListComponent }
 *
 * }
 *
 * ```
 *
 * Actual usage could be :
 *
 *
 * ```
 *  layout=Inspect2#Stack {
 * \@layout=First#Form {
 *           elementStyle:"padding-bottom:100px";
 *       }
 * \@layout=Second#Form { zonePath:Second; }
 *   }
 *
 *
 *
 *    class=User {
 *       zNone => *;
 *       zLeft => firstName => lastName => age => department;
 *       Second.zLeft => email;
 *
 *   }
 *
 * ```
 *
 */
class MetaElementListComponent extends MetaLayout {
    /**
     * @param {?} _metaContext
     * @param {?} env
     * @param {?} sanitizer
     */
    constructor(_metaContext, env, sanitizer) {
        super(_metaContext, env);
        this._metaContext = _metaContext;
        this.env = env;
        this.sanitizer = sanitizer;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    styleString(name) {
        let /** @type {?} */ lContext = this.contextMap.get(name);
        // return isPresent(lContext) && isPresent(lContext.propertyForKey('elementStyle')) ?
        //     this.sanitizer.bypassSecurityTrustStyle(lContext.propertyForKey('elementStyle')) :
        // null;
        return null;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    classString(name) {
        let /** @type {?} */ lContext = this.contextMap.get(name);
        return isPresent(lContext) ? lContext.propertyForKey('elementClass') : null;
    }
}
MetaElementListComponent.decorators = [
    { type: Component, args: [{
                template: `<!--<b>MetaElementList: {{allLayouts}} </b>-->
<!--<pre [innerHTML]="context.debugString()"></pre>-->

<ng-template ngFor [ngForOf]="allLayouts" let-cLayout>

    <m-context [layout]="cLayout.name" (afterContextSet)="afterContextSet($event)"
               (beforeContextSet)="beforeContextSet($event)">

        <!--<b>MetaElementList: layout {{cLayout.name}} </b>-->
        <!--<pre [innerHTML]="debugString(cLayout.name)"></pre>-->

        <div class="ui-g ">
            <div class="ui-g-12 ui-g-nopad" [ngClass]="classString(cLayout.name)"
                 [ngStyle]="styleString(cLayout.name)"
            >
                <m-include-component></m-include-component>
            </div>
        </div>
    </m-context>

</ng-template>

`,
                styles: [``]
            },] },
];
/** @nocollapse */
MetaElementListComponent.ctorParameters = () => [
    { type: MetaContextComponent },
    { type: Environment },
    { type: DomSanitizer }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * MetaActionList provides a way how to attach actions to the screen. We can use \@action declaration
 * to define new action and their actionResults. actionResults is an expression that is executed
 * and either redirect you to different page or some logic is executed.
 *
 * Actions can be organized into action categories but if we do not provide any action category
 * default one is used.
 *
 * This way we define placeholder using a layout where actions are inserted
 *
 *
 * ```html
 *
 *    layout=Inspect2#Stack {
 * \@layout=MenuTop#ActionButtons {
 *       }
 *
 * \@layout=First#Form {
 *     }
 *
 * \@layout=Second#Form { zonePath:Second; }
 *  }
 *
 *
 * ```
 *
 * And this is how we define actions for current page/class/object
 *
 * ```
 * \@action=update {
 *             actionResults:${ object.firstName = "Mr." +  object.firstName };
 *             visible: ${ properties.editing };
 *    }
 *
 *
 * \@action=Save {
 *             label: "My Save";
 *             actionResults:${ object.firstName = "Ms." +  object.firstName };
 *             visible: ${ properties.editing };
 *             buttonStyle:info;
 *    }
 * ```
 *
 *
 *
 *
 *
 *
 *
 */
class MetaActionListComponent extends MetaBaseComponent {
    /**
     * @param {?} _metaContext
     * @param {?} env
     */
    constructor(_metaContext, env) {
        super(env, _metaContext);
        this._metaContext = _metaContext;
        this.env = env;
        /**
         *
         * Defines type of components that renders our actions. We have 3 types:
         * Buttons, Links and Popup Menu
         *
         */
        this.renderAs = 'buttons';
        /**
         * Default style used for the buttons if none is specified
         *
         */
        this.defaultStyle = 'info';
        /**
         * Tells us if the action should be rendered on the left or right side
         *
         */
        this.align = 'right';
        /**
         * Map linking the name of the layout to the actual context. We need this when we need
         * to access current content.
         *
         */
        this._contextMap = new Map();
    }
    /**
     * Read and stores current action categories available to current Context
     *
     * @return {?}
     */
    actionCategories() {
        if (isBlank(this._actionsByCategory) || isBlank(this._actionsByName)) {
            if (isPresent(this.filterActions)) {
                this.context.set('filterActions', this.filterActions);
            }
            let /** @type {?} */ meta = /** @type {?} */ (this.context.meta);
            this.context.push();
            this.menuModel = [];
            this._actionsByCategory = new Map();
            this._actionsByName = new Map();
            this.categories = meta.actionsByCategory(this.context, this._actionsByCategory, UIMeta.ActionZones);
            this.context.pop();
            this._actionsByCategory.forEach((v, k) => {
                v.forEach((item) => this._actionsByName.set(item.name, item));
            });
        }
        return this.categories;
    }
    /**
     *
     * Action belonging to current category..
     *
     * @param {?} category
     * @return {?}
     */
    actions(category) {
        return this._actionsByCategory.get(category.name);
    }
    /**
     *
     * When action clicked this method delegates it into meta layer to be executed.
     *
     * @param {?} action
     * @return {?}
     */
    actionClicked(action) {
        let /** @type {?} */ context = this._contextMap.get(action);
        let /** @type {?} */ meta = /** @type {?} */ (context.meta);
        meta.fireActionFromProps(this._actionsByName.get(action), /** @type {?} */ (context));
    }
    /**
     * A hook used to store the most current context for each action.
     *
     * @param {?} actionName
     * @return {?}
     */
    onAfterContextSet(actionName) {
        let /** @type {?} */ aContext = this._metaContext.activeContext().snapshot().hydrate(false);
        this._contextMap.set(actionName, aContext);
        if (this.renderAs === 'menu') {
            this.populateMenu(actionName);
        }
    }
    /**
     * A hook used to store the most current context for each action.
     *
     * @param {?} change
     * @return {?}
     */
    onContextChanged(change) {
        console.log('Changed = ' + change);
    }
    /**
     * @param {?} actionName
     * @return {?}
     */
    label(actionName) {
        let /** @type {?} */ context = this._contextMap.get(actionName);
        return super.aProperties(context, UIMeta.KeyLabel);
    }
    /**
     * @param {?} actionName
     * @return {?}
     */
    isActionDisabled(actionName) {
        let /** @type {?} */ context = this._contextMap.get(actionName);
        return isPresent(context) ? !context.booleanPropertyForKey('enabled', false) : true;
    }
    /**
     * @return {?}
     */
    alignRight() {
        return this.align === 'right';
    }
    /**
     * @param {?} actionName
     * @return {?}
     */
    style(actionName) {
        let /** @type {?} */ context = this._contextMap.get(actionName);
        let /** @type {?} */ style = super.aProperties(context, 'buttonStyle');
        return isPresent(style) ? style : this.defaultStyle;
    }
    /**
     * @param {?} actionName
     * @return {?}
     */
    populateMenu(actionName) {
        let /** @type {?} */ label = this.label(actionName);
        let /** @type {?} */ index = this.menuModel.findIndex((item) => item.actionName === actionName);
        let /** @type {?} */ itemCommand = {
            label: label,
            actionName: actionName,
            disabled: this.isActionDisabled(actionName),
            command: (event) => {
                this.actionClicked(event.item.actionName);
            }
        };
        if (index === -1) {
            this.menuModel.push(itemCommand);
        }
        else {
            this.menuModel[index] = itemCommand;
        }
    }
}
MetaActionListComponent.decorators = [
    { type: Component, args: [{
                template: `<span [class.u-flr]="alignRight()">
    <m-context *ngIf="renderAs === 'buttons'">
        <ng-template ngFor [ngForOf]="actionCategories()" let-category>
            <m-context [actionCategory]="category.name">
                <ng-template ngFor [ngForOf]="actions(category)" let-action>
                    <m-context [action]="action.name"
                               (onContextChanged)="onContextChanged($event)"
                               (afterContextSet)="onAfterContextSet($event)">
                        <aw-button (action)="actionClicked(action.name)"
                                   [style]="style(action.name)"
                                   [disabled]="isActionDisabled(action.name)">

                        {{ label(action.name) }}
                        </aw-button>
                    </m-context>
                </ng-template>
            </m-context>

        </ng-template>
    </m-context>

    <m-context *ngIf="renderAs === 'links'">
        <ng-template ngFor [ngForOf]="actionCategories()" let-category>
            <m-context [actionCategory]="category.name">
                <ng-template ngFor [ngForOf]="actions(category)" let-action>
                    <m-context [action]="action.name"
                               (onContextChanged)="onContextChanged($event)"
                               (afterContextSet)="onAfterContextSet($event)">
                        <aw-button (action)="actionClicked(action.name)"
                                   [style]="'link'"
                                   [disabled]="isActionDisabled(action.name)">

                        {{ label(action.name) }}
                        </aw-button>
                    </m-context>
                </ng-template>
            </m-context>

        </ng-template>
    </m-context>

    <m-context *ngIf="renderAs === 'menu'">
        <ng-template ngFor [ngForOf]="actionCategories()" let-category>
            <m-context [actionCategory]="category.name">

                <ng-template ngFor [ngForOf]="actions(category)" let-action>
                    <m-context [action]="action.name"
                               (onContextChanged)="onContextChanged($event)"
                               (afterContextSet)="onAfterContextSet($event)">
                    </m-context>
                </ng-template>
            </m-context>
        </ng-template>

        <p-menu #menu popup="popup" [model]="menuModel"></p-menu>

        <!-- todo: extend button to support icons -->
        <aw-button (action)="menu.toggle($event)">
            Actions
        </aw-button>

    </m-context>
</span>





`,
                styles: [`.m-action-list{width:100%}`]
            },] },
];
/** @nocollapse */
MetaActionListComponent.ctorParameters = () => [
    { type: MetaContextComponent },
    { type: Environment }
];
MetaActionListComponent.propDecorators = {
    renderAs: [{ type: Input }],
    defaultStyle: [{ type: Input }],
    align: [{ type: Input }],
    filterActions: [{ type: Input }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Default homePage implementation for a Module. Just like on the example bellow when we define a
 * module without a homePage this MetaHomePageComponent will be used.
 *
 * ```
 *
 * \@module=Home {
 *       label:"My Home";
 *       pageTitle:"You are now on Homepage";
 *
 * \@layout=Today {
 *          after:zTop;
 *          label: "Sales Graph";
 *          component:SalesGraphComponent;
 *     }
 *  }
 *
 * ```
 * Or you can decide not to use this MetaHomePage and Provide your own e.g:
 *
 * ```
 * \@module=Products {
 *      label:"Products for Somethig";
 *      pageTitle:"You are now on Products";
 *      homePage:ProductContentComponent;
 *  }
 *
 * ```
 *
 *
 */
class MetaHomePageComponent extends BaseComponent {
    /**
     * @param {?} env
     * @param {?} activatedRoute
     */
    constructor(env, activatedRoute) {
        super(env);
        this.env = env;
        this.activatedRoute = activatedRoute;
    }
    /**
     *
     * This page is triggered by router and we expect a module to be passed in by routing
     * params
     *
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        let /** @type {?} */ routeParams = this.activatedRoute.snapshot.params;
        if (isPresent(routeParams) && isPresent(routeParams[UIMeta.KeyModule])) {
            this.module = routeParams[UIMeta.KeyModule];
        }
    }
    /**
     * @return {?}
     */
    hasModule() {
        return isPresent(this.module);
    }
}
MetaHomePageComponent.decorators = [
    { type: Component, args: [{
                selector: 'm-home-page',
                template: `<div class="m-page" *ngIf="hasModule()">
    <m-context [module]="module">
        <m-include-component></m-include-component>
    </m-context>

</div>


`,
                styles: [`.m-page{width:100%;margin:0 auto;padding:5px}.m-page:after{content:".";display:block;height:0;clear:both;visibility:hidden}.module-footer{clear:both}`]
            },] },
];
/** @nocollapse */
MetaHomePageComponent.ctorParameters = () => [
    { type: Environment },
    { type: ActivatedRoute }
];
MetaHomePageComponent.propDecorators = {
    module: [{ type: Input }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 *
 * Defines 4 sizes for the portlet size
 *
 */
const /** @type {?} */ PortletSizes = {
    'small': 'ui-md-3',
    'medium': 'ui-md-4',
    'wide': 'ui-md-6',
    'large': 'ui-md-12'
};
/**
 * Simple Dashboard implementation for the homePage. Just like we support inside MetaFormTable
 * different zones and distribute fields to them, we do the same with defined layouts.
 *
 * This dashboard supports 3 zones.
 *
 *    zToc: This is the place where usually all the actions or 2nd level navigation will go
 *    zTop,zBottom: is where the portlets are rendered.
 *
 *
 * To distribute layouts to different zones :
 *
 * ```
 * \@module=Home {
 *           label:"My Home";
 *           pageTitle:"You are now on Homepage";
 *
 *
 * \@layout=Today {
 *              after:zTop;
 *              label: "Sales Graph";
 *              component:SalesGraphComponent;
 *
 *           }
 *
 * \@layout=Sport {
 *              after:Today;
 *              label: "Sport today!";
 *              component:StringComponent;
 *              bindings:{value:"The Texas Tech quarterback arrived at  " }
 *
 *           }
 *
 * ```
 *
 *  or Push actions to the zToc zone:
 *
 * ```
 * \@module=Home {
 *           label:"My Home";
 *           pageTitle:"You are now on Homepage";
 *
 *
 * \@layout=Today {
 *              after:zTop;
 *              label: "Sales Graph";
 *              component:SalesGraphComponent;
 *
 *           }
 *
 * \@layout=Actions#ActionLinks {
 *               label:$[a004]Actions;
 *                after:zToc;
 *            }
 *
 *
 * \@actionCategory=Create {
 * \@action=NewBlog#pageAction { pageName:blogPage;}
 * \@action=NewChart#pageAction { pageName:chartPage;}
 *           }
 *
 * }
 *
 *
 *
 */
class MetaDashboardLayoutComponent extends MetaLayout {
    /**
     * @param {?} metaContext
     * @param {?} env
     */
    constructor(metaContext, env) {
        super(metaContext, env);
        /**
         * Defines if sidebar is collapsed or expanded
         *
         */
        this.activeMenu = false;
        /**
         * Current Module name
         *
         */
        this.dashboardName = '';
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this.dashboardName = this.label();
    }
    /**
     * @param {?} event
     * @return {?}
     */
    toggleMenu(event) {
        this.activeMenu = !this.activeMenu;
    }
    /**
     * @return {?}
     */
    zones() {
        return MetaDashboardLayoutComponent.ZonesTB;
    }
    /**
     * @return {?}
     */
    topLayouts() {
        let /** @type {?} */ tops = this.layoutsByZones.get(UIMeta.ZoneTop);
        return isPresent(tops) ? tops : [];
    }
    /**
     * @param {?} name
     * @return {?}
     */
    portletWidth(name) {
        let /** @type {?} */ lContext = this.contextMap.get(name);
        let /** @type {?} */ width = lContext.propertyForKey('portletWidth');
        return isPresent(width) && isPresent(PortletSizes[width]) ? PortletSizes[width] :
            'ui-md-4';
    }
    /**
     * @return {?}
     */
    bottomLayouts() {
        let /** @type {?} */ bottom = this.layoutsByZones.get(UIMeta.ZoneBottom);
        return isPresent(bottom) ? bottom : [];
    }
    /**
     * @return {?}
     */
    zTocLayouts() {
        let /** @type {?} */ bottom = this.layoutsByZones.get(MetaDashboardLayoutComponent.ZoneToc);
        return isPresent(bottom) ? bottom : [];
    }
}
/**
 * New defined zone for Actions
 *
 */
MetaDashboardLayoutComponent.ZoneToc = 'zToc';
MetaDashboardLayoutComponent.ZonesTB = [
    MetaDashboardLayoutComponent.ZoneToc, UIMeta.ZoneTop,
    UIMeta.ZoneBottom
];
MetaDashboardLayoutComponent.decorators = [
    { type: Component, args: [{
                template: `<div>
    <span class="m-dashbord-name">{{dashboardName}} </span>
    <span class="m-dashbord-lbl"> Dashboard</span>
</div>


<div id="m-toggle-bar" *ngIf="zTocLayouts().length > 0">
    <aw-hyperlink (action)="toggleMenu($event)" [size]="'large'">
        <i class="fa fa-bars"></i>
    </aw-hyperlink>
</div>
<div id="m-toc" [class.active]="activeMenu" *ngIf="zTocLayouts().length > 0">
    <div class="ui-g ">
        <m-context *ngFor="let layout of zTocLayouts()"
                   [layout]="layout.name" (afterContextSet)="afterContextSet($event)"
                   (beforeContextSet)="beforeContextSet($event)">

            <div class="ui-g-12 " [ngClass]="portletWidth(layout.name)">
                <p-panel [header]="labelForContext(layout.name)">
                    <m-include-component></m-include-component>
                </p-panel>
            </div>
        </m-context>
    </div>
</div>

<div id="m-content">
    <div class="ui-g m-dashboard">
        <!-- top -->
        <div class="ui-g-12">
            <div class="ui-g ">
                <m-context *ngFor="let layout of topLayouts()"
                           [layout]="layout.name" (afterContextSet)="afterContextSet($event)"
                           (beforeContextSet)="beforeContextSet($event)">

                    <div class="ui-g-12 " [ngClass]="portletWidth(layout.name)">
                        <p-panel [header]="labelForContext(layout.name)" [toggleable]="true">
                            <m-include-component></m-include-component>
                        </p-panel>
                    </div>
                </m-context>
            </div>
        </div>

        <!-- bottom -->
        <div class="ui-g-12">
            <div class="ui-g ">
                <m-context *ngFor="let layout of bottomLayouts()"
                           [layout]="layout.name" (afterContextSet)="afterContextSet($event)"
                           (beforeContextSet)="beforeContextSet($event)">

                    <div class="ui-g-12 " [ngClass]="portletWidth(layout.name)">
                        <p-panel [header]="labelForContext(layout.name)" [toggleable]="true">
                            <m-include-component></m-include-component>
                        </p-panel>
                    </div>
                </m-context>
            </div>
        </div>
    </div>
</div>



`,
                styles: [`#m-toc{position:relative;float:left;z-index:99;width:15em;padding:.5em;box-shadow:6px 0 10px -4px rgba(0,0,0,.3)}#m-content{float:left;padding-top:1em;padding-left:1em;height:auto}#m-toggle-bar{box-sizing:border-box;border-bottom:1px solid #dde3e6;overflow:hidden;display:none;border-radius:5px;padding:.5em;width:2em;height:2.3em}#m-toggle-bar:focus,#m-toggle-bar:hover{background-color:#ececec}#m-toggle-bar:after{content:'';display:block;clear:both}.m-dashbord-name{font-weight:600}.ui-g{display:block}@media screen and (max-width:64em){#m-toc{display:none;overflow-y:auto;z-index:999}#m-toc.active{display:block}#m-toggle-bar{display:block;position:relative;z-index:1000;margin-right:1em}}`]
            },] },
];
/** @nocollapse */
MetaDashboardLayoutComponent.ctorParameters = () => [
    { type: MetaContextComponent },
    { type: Environment }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * MetaSection renders list of sections defined by \@trait inside WidgetsRules. It uses layouts to
 * structure the list.
 *
 * ```
 *  layout {
 * \@trait=Sections { visible:true; component:MetaSectionsComponent }
 *  }
 *
 * ```
 *
 * and can be used as :
 *
 * ```
 *     layout=RfxDetailLayout#Sections {
 *
 * \@layout=Header#Form {
 *             trait:labelsOnTop;
 *             zonePath:Header;
 *
 *             bindings: {
 *                 description:$object.header.description;
 *             }
 *         }
 * \@layout=LineItems {
 *             component:RfxLineItemsComponent;
 *             bindings: {
 *                 rfxEvent:$object;
 *             }
 *         }
 * \@layout=Participants {
 *             component:RfxParticipantsComponent;
 *             bindings: {
 *                 rfxEvent:$object;
 *             }
 *         }
 *     }
 *
 *
 *     class=RfxEventHeader {
 *         zNone => *;
 *         Header.zLeft => requester => region => needBy;
 *     }
 * ```
 * In above example we have first section with Form where RfxEventHeader sends its fields
 * and several other sections with custom component.
 *
 *
 */
class MetaSectionsComponent extends MetaLayout {
    /**
     * @param {?} _metaContext
     * @param {?} env
     */
    constructor(_metaContext, env) {
        super(_metaContext, env);
        this._metaContext = _metaContext;
        this.env = env;
        this.sectionOperations = {};
        this.onCompleteSubscriptions = {};
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this.allLayouts.forEach((value) => {
            this.sectionOperations[value.name] = 'view';
        });
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        super.ngDoCheck();
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.sections = [...this.viewSections.toArray()];
    }
    /**
     * Action handler to broadcast event outside so it can be handled by the application
     *
     * @param {?} name
     * @param {?} sectionIndex
     * @param {?} cnxName
     * @param {?} event
     * @return {?}
     */
    onAction(name, sectionIndex, cnxName, event) {
        let /** @type {?} */ section = this.sections[sectionIndex];
        if (this.env.hasValue('parent-cnx')) {
            let /** @type {?} */ cnx = this.env.getValue('parent-cnx');
            cnx.onAction.emit(new MetaUIActionEvent(section, name, cnxName, event));
        }
        if (name === 'onEdit' && section.editState && section.editMode === 'default') {
            this.sectionOperations[cnxName] = 'edit';
            if (isBlank(this.onCompleteSubscriptions[cnxName])) {
                section.onEditingComplete.subscribe((value) => this.sectionOperations[cnxName] = 'view');
                this.onCompleteSubscriptions[cnxName] = section;
            }
        }
    }
    /**
     *
     * Retrieves a property from the current context
     *
     * @param {?} propName
     * @param {?} cnxName
     * @param {?} defaultVal
     * @return {?}
     */
    sectionProp(propName, cnxName, defaultVal) {
        let /** @type {?} */ lContext = this.contextMap.get(cnxName);
        return (isPresent(lContext) && isPresent(lContext.propertyForKey(propName))) ?
            lContext.propertyForKey(propName) : defaultVal;
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.allLayouts.forEach((value) => {
            if (isPresent(this.onCompleteSubscriptions[value.name])) {
                this.onCompleteSubscriptions[value.name].onEditingComplete.unsubscribe();
            }
        });
    }
}
MetaSectionsComponent.decorators = [
    { type: Component, args: [{
                template: `<div class="meta-sections">

    <m-context *ngFor="let layout of allLayouts; let i = index" [layout]="layout.name"
               [operation]="sectionOperations[layout.name]"
               (afterContextSet)="afterContextSet($event)"
               (beforeContextSet)="beforeContextSet($event)">

        <aw-section [title]="sectionProp('title', layout.name, null)"
                    [description]="sectionProp('description', layout.name, null)"
                    [opened]="sectionProp('opened', layout.name, true)"
                    [actionIcon]="sectionProp('actionIcon', layout.name, 'icon-edit')"
                    [editable]="sectionProp('canEdit', layout.name, false)"
                    [editMode]="sectionProp('editMode', layout.name, 'default')"
                    [disableClose]="sectionProp('disableClose', layout.name, false)"
                    (onEdit)="onAction('onEdit', i, layout.name, $event)"
                    (onSaveAction)="onAction('onSaveAction', i, layout.name, $event)"
                    (onCancelAction)="onAction('onCancelAction', i, layout.name, $event)">

            <m-include-component></m-include-component>
        </aw-section>

    </m-context>
</div>
`,
                styles: [``]
            },] },
];
/** @nocollapse */
MetaSectionsComponent.ctorParameters = () => [
    { type: MetaContextComponent },
    { type: Environment }
];
MetaSectionsComponent.propDecorators = {
    viewSections: [{ type: ViewChildren, args: [SectionComponent,] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Just like MetaContentPage this components renders meta context details but embedded as some
 * inline component. Not a page with page level buttons
 *
 *
 * Todo: We dont really need this component we we in the future extends MetaIncludeComponent to
 * support awcontentElement:
 *
 * ```
 *  {
 *      component:MetaContextComponent;
 *      bindings: {
 *          object:$value;
 *          layout:Inspect;
 *          operation:view;
 *          awcontentElement:MetaIncludeComponnetDirective;
 *      }
 *
 *  }
 *
 *  ```
 *
 *  This would instantiate right meta context just like this class.
 */
class MetaObjectDetailComponent extends BaseComponent {
    /**
     * @param {?} env
     */
    constructor(env) {
        super(env);
        this.env = env;
        /**
         * For the detail view we always use read only content
         */
        this.operation = 'view';
        /**
         * Default layout
         *
         */
        this.layout = 'Inspect';
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        if (isBlank(this.object) || !isStringMap(this.object)) {
            throw new Error('Cannot render primitive values as object details!');
        }
    }
}
MetaObjectDetailComponent.decorators = [
    { type: Component, args: [{
                selector: 'm-content-detail',
                template: `<m-context [pushNewContext]="true" [object]="object" [operation]="operation"
           [layout]="layout" group="ObjectDetail">

    <div class="w-object-detail">
        <m-include-component></m-include-component>
    </div>

</m-context>
`,
                styles: [``]
            },] },
];
/** @nocollapse */
MetaObjectDetailComponent.ctorParameters = () => [
    { type: Environment }
];
MetaObjectDetailComponent.propDecorators = {
    object: [{ type: Input }],
    operation: [{ type: Input }],
    layout: [{ type: Input }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class AWMetaLayoutModule {
}
AWMetaLayoutModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    MetaIncludeComponentDirective,
                    MetaFormComponent,
                    MetaFormTableComponent,
                    MetaFormRowComponent,
                    NoMetaComponent,
                    MetaContentPageComponent,
                    MetaElementListComponent,
                    MetaActionListComponent,
                    MetaHomePageComponent,
                    MetaDashboardLayoutComponent,
                    MetaSectionsComponent,
                    MetaObjectDetailComponent,
                ],
                imports: [
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    AWMetaCoreModule,
                    AribaCoreModule,
                    AribaComponentsModule
                ],
                entryComponents: [
                    MetaFormComponent,
                    MetaFormTableComponent,
                    MetaFormRowComponent,
                    NoMetaComponent,
                    MetaContentPageComponent,
                    MetaContentPageComponent,
                    MetaElementListComponent,
                    MetaActionListComponent,
                    MetaHomePageComponent,
                    MetaDashboardLayoutComponent,
                    MetaSectionsComponent,
                    MetaObjectDetailComponent
                ],
                exports: [
                    MetaIncludeComponentDirective,
                    MetaFormComponent,
                    MetaFormTableComponent,
                    MetaFormRowComponent,
                    NoMetaComponent,
                    MetaContentPageComponent,
                    MetaContentPageComponent,
                    MetaElementListComponent,
                    MetaActionListComponent,
                    MetaHomePageComponent,
                    MetaDashboardLayoutComponent,
                    MetaSectionsComponent,
                    ReactiveFormsModule,
                    FormsModule,
                    AribaCoreModule,
                    AribaComponentsModule,
                    MetaObjectDetailComponent
                ],
                providers: []
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

var sysMetaComponents = /*#__PURE__*/Object.freeze({
    ACTIVE_CNTX: ACTIVE_CNTX,
    MetaContextComponent: MetaContextComponent,
    MetaUIActionEvent: MetaUIActionEvent,
    AWMetaLayoutModule: AWMetaLayoutModule,
    MetaContentPageComponent: MetaContentPageComponent,
    MetaFormComponent: MetaFormComponent,
    MetaFormRowComponent: MetaFormRowComponent,
    MetaFormTableComponent: MetaFormTableComponent,
    NoMetaComponent: NoMetaComponent,
    MetaIncludeComponentDirective: MetaIncludeComponentDirective,
    MetaBaseComponent: MetaBaseComponent,
    MetaElementListComponent: MetaElementListComponent,
    MetaActionListComponent: MetaActionListComponent,
    MetaHomePageComponent: MetaHomePageComponent,
    MetaDashboardLayoutComponent: MetaDashboardLayoutComponent,
    MetaSectionsComponent: MetaSectionsComponent,
    MetaObjectDetailComponent: MetaObjectDetailComponent
});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ routes = [
    { path: 'context', component: MetaContentPageComponent }
];
class AribaMetaUIRoutingModule {
}
AribaMetaUIRoutingModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    RouterModule.forChild(routes)
                ],
                exports: [RouterModule],
                providers: []
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * This module contains everything needs to dynamically generated UI based on metaRules
 * Since we are using primeNG, check AribaComponent if its already imported so you dont have
 * import it again.
 *
 */
class AribaMetaUIModule {
    constructor() {
    }
}
AribaMetaUIModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    AribaMetaUIRoutingModule,
                    AWMetaCoreModule,
                    AWMetaLayoutModule
                ],
                exports: [
                    AWMetaCoreModule,
                    AWMetaLayoutModule
                ],
                providers: [
                    {
                        'provide': APP_INITIALIZER,
                        'useFactory': initMetaUI,
                        'deps': [Injector],
                        'multi': true,
                    },
                ],
            },] },
];
/** @nocollapse */
AribaMetaUIModule.ctorParameters = () => [];
/**
 *
 * Entry factory method that initialize The METAUI layer and here we load WidgetsRules.oss as well
 * as Persistence Rules.
 *
 * @param {?} injector
 * @return {?}
 */
function initMetaUI(injector) {
    let /** @type {?} */ initFce = function init(inj) {
        let /** @type {?} */ promise = new Promise((resolve) => {
            let /** @type {?} */ metaUI = UIMeta.getInstance();
            // access services lazily when they are needed and initialized as workaround for
            // https://github.com/angular/angular/issues/16853
            metaUI.injector = inj;
            metaUI.registerLoader(new RuleLoaderService());
            metaUI.loadDefaultRuleFiles(sysMetaComponents);
            resolve(true);
        });
        return promise;
    };
    return initFce.bind(initFce, injector);
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { Activation, Assignment, AssignmentSnapshot, Context, DeferredAssignment, ObjectMetaContext, PropertyAccessor, Snapshot, StaticRec, UIContext, ItemProperties, Match, MatchResult, MatchWithUnion, UnionMatchResult, Meta, KeyValueCount, PropertyManager, OverrideValue, KeyData, PropertyMap, PropertyMergerDynamic, PropertyMerger_Overwrite, PropertyMerger_List, PropertyMergerDeclareList, PropertyMergerDeclareListForTrait, PropertyMerger_And, PropertyMerger_Valid, RuleSet, ValueMatches, MultiMatchValue, KeyValueTransformer_KeyPresent, isPropertyMapAwaking, NestedMap, FieldTypeIntrospectionMetaProvider, IntrospectionMetaProvider, ObjectMeta, ObjectMetaPropertyMap, OMPropertyMerger_Valid, SystemPersistenceRules, DynamicPropertyValue, StaticallyResolvable, StaticDynamicWrapper, StaticallyResolvableWrapper, ContextFieldPath, isDynamicSettable, Expr, DeferredOperationChain, ValueConverter, Rule, RuleWrapper, Selector, RuleLoaderService, LocalizedString, UIMeta, SystemRules, ModuleInfo, AWMetaCoreModule, MetaUIActionEvent, MetaContentPageComponent, MetaFormComponent, MetaFormRowComponent, MetaFormTableComponent, NoMetaComponent, MetaIncludeComponentDirective, MetaBaseComponent, MetaElementListComponent, MetaHomePageComponent, AWMetaLayoutModule, MetaSectionsComponent, MetaObjectDetailComponent, MetaContextComponent, AribaMetaUIModule, initMetaUI, AribaMetaUIRoutingModule, MetaActionListComponent as ɵa, MetaDashboardLayoutComponent as ɵb, MetaLayout as ɵc };
