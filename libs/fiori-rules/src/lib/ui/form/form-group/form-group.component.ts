/**
 * @license
 * F. Kolar
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
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormFieldComponent} from '../form-field/form-field.component';
import {startWith, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';


/**
 *
 * FormGroup represent high order container aggregating FormFields and ability to distribute these
 * fields into columns. Well behaved form that has information side by side in multiple
 * columns needs to also know how to merge properly.
 *
 * Just to get the idea about the structure without actual input components inside
 *
 * ```html
 * <fdp-form-group [hintLayout]="'inline'" [multiLayout]="true">
 *    <fdp-form-field [id]="'Field A'" [rank]="10" zone="zLeft">
 *    </fdp-form-field>
 *
 *    <fdp-form-field [id]="'Field B'" [rank]="30" zone="zLeft">
 *    </fdp-form-field>
 *
 *    <fdp-form-field [id]="'Field C'"  [rank]="20" zone="zLeft">
 *    </fdp-form-field>
 *
 *    <fdp-form-field [id]="Field D"  [rank]="20" zone="zRight">
 *    </fdp-form-field>
 *
 *
 *    <fdp-form-field [id]="'Field E'" [rank]="30" zone="zRight">
 *    </fdp-form-field>
 * </fdp-form-group>

 *
 * ````
 *
 *
 * Which can be translated like this
 * [Field A] - Left, rank 10
 * [Field B] - Left, rank 30
 * [Field C] - Left, rank 20
 * [Field D] - Right, rank 20
 * [Field E] - Right, rank 30
 *
 * What we expect that it creates following form with two column layout:
 * [Field A]      [Field D]
 * [Field C]      [Field E]
 * [Field B]
 *
 * You can see all is sorted accordingly by rank (C goes before B).
 *
 * When you move into smaller device and all is merged into one columns the naive solution would be:
 *
 * [Field A]
 * [Field C]
 * [Field B]
 * [Field D]
 * [Field E]
 *
 * The fields needs to restructure according to their original positioning. When Field D was on the
 * top why we should move it to the bottom? The more correct solution should be following.
 *
 * [Field A]
 * [Field D]
 * [Field C]
 * [Field E]
 * [Field B]
 *
 * Fields nicely merge together. they dont wrap.
 *
 *
 * Besides this layout support it also wraps form functionality and it can work with FormGroup.
 * You can also decide if you want your form with <form> element or without it.
 *
 *
 */
@Component({
  selector: 'fdp-form-group',
  templateUrl: 'form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FormGroupComponent implements OnInit, AfterContentInit, AfterContentChecked,
  AfterViewInit, OnDestroy {

  @Input()
  id: string;

  @Input()
  name: string;

  @Input()
  multiLayout: boolean = false;

  @Input()
  formGroup: FormGroup;

  @Input()
  useForm: boolean = false;

  /**
   * This is rather simple for now just to have some Section Title if needed
   */
  @Input()
  topTitle: string;

  @Input()
  mainTitle: string;

  @Input()
  bottomTitle: string;


  @Input()
  get hintLayout(): 'inline' | 'popover' {
    return this._hintLayout;
  }

  set hintLayout(value: 'inline' | 'popover') {
    this._hintLayout = value;
    this._cd.markForCheck();
  }

  private _hintLayout: 'inline' | 'popover' = 'popover';


  @Output()
  onSubmit: EventEmitter<any> = new EventEmitter<any>();

  protected _destroyed = new Subject<void>();

  /**
   * Cached fields so we dont have recalculate them every time
   */
  mZone: Array<GroupField>;
  tZone: Array<GroupField>;
  bZone: Array<GroupField>;

  /**
   *  Form fields within the formGroup is driven by multi-zone layout support. We need to be
   *  able to add number of FormFields, and based on given configuration (zone, rank) render them
   *  under correct zone  (top, bottom, left, right).
   *
   *  We want to make sure that we dont include content and then try to somehow position it as it
   *  would lead to the UI where user can see elementing moving as you try to position it.
   */
  @ContentChildren(FormFieldComponent, {descendants: true})
  _fieldChildren: QueryList<FormFieldComponent>;

  constructor(private _cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (!this.formGroup) {
      this.formGroup = new FormGroup({});
    }
  }


  ngAfterContentChecked(): void {
    if (!this.validateFormFields()) {
      throw new Error('fdp-form-group must contain a fdp-form-field.');
    }
  }


  ngAfterContentInit(): void {
    this._fieldChildren.changes
      .pipe(startWith(null), takeUntil(this._destroyed))
      .subscribe(() => {
        this.updateFieldByZone();
        this._cd.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    this._cd.detectChanges();
  }


  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }


  trackByFieldName(index, zoneField: GroupField) {
    return zoneField ? zoneField.name : undefined;

  }

  /**
   * Make sure we have expected childs.
   */
  private validateFormFields(): boolean {
    return this._fieldChildren.filter(item => !(item instanceof FormFieldComponent)).length === 0;
  }

  /**
   * This reads FormFieldComponent from the QueyList and break all down into individual zones.
   * Right now I support only 5 zones, but it could be easily extended to support any number of
   * columns.
   * Since I want to have cached I know zones ahead of time, but you can have this generic and
   * store everything in Map. Since here we have OnPush CD strategy it should not be a big deal.
   */
  private updateFieldByZone() {
    const zLeft: Array<GroupField> = [];
    const zRight: Array<GroupField> = [];

    this._fieldChildren.forEach((item, index) => {
      item.hintLayout = this._hintLayout;
      const zone = (this.multiLayout) ? item.zone || 'zLeft' : 'zLeft';
      const field = new GroupField(zone, item.id, item.rank || index, item.renderer,
        item.fluid);

      switch (zone) {
        case 'zTop':
          if (!this.tZone) {
            this.tZone = [];
          }
          this.tZone.push(field);
          break;
        case 'zBottom':
          if (!this.bZone) {
            this.bZone = [];
          }
          this.bZone.push(field);
          break;
        case 'zLeft':
          zLeft.push(field);
          break;
        case 'zRight':
          zRight.push(field);
          break;
      }
    });

    this.evenFields(zLeft, zRight);
    this.mZone = this.calculateMainZone(zLeft, zRight);
  }


  /**
   * To achieve LEFT and RIGHT layout we need to iterate and merge LEFT and RIGHT zones together
   * and assign each field an rank number they will appear in teh UI. Just think of one columns
   * layout when they are merged.
   *
   * [Field 1] - zoneLeft, rank 1
   * [Field 2] - zoneLeft, rank 2
   * [Field 3] - zoneRight, rank 20
   * [Field 4] - zoneRight, rank 30
   *
   *
   * [Field 1]      [Field 3]
   * [Field 2]      [Field 4]
   *
   * When they are merged together into one column:
   *
   * [Field 1]
   * [Field 3]
   * [Field 2]
   * [Field 4]
   *
   * We can pre-calculate and cache.
   *
   * We take a rank for each zone sort fields inside and then based on number of support it columns
   * we need rearrange entries and give it different rank as it shows on the UI screen.
   *
   * Rank is important here, because its read by [style.order] in the template that nicelly
   * re-arrange fields based on its rank number. Its pure CSS solution
   *
   */
  private calculateMainZone(left: GroupField[], right: GroupField[]): GroupField[] {

    console.log('calculateMainZone');
    if (left.length > 0 && right.length > 0) {

      const merged: GroupField[] = [];
      let indexL = 0, indexR = 0, current = 0;

      while (current < (left.length + right.length)) {
        if (indexL < left.length) {
          const field = new GroupField(left[indexL].zone, left[indexL].name, current,
            left[indexL].renderer, left[indexL].isFluid);
          merged[current++] = field;
          indexL++;

          if (field.isFluid) {
            continue;
          }
        }
        if (indexR < right.length) {
          merged[current++] = new GroupField(right[indexR].zone, right[indexR].name, current,
            right[indexR].renderer);
          indexR++;
        }
      }
      return merged;

    } else if (left.length > 0) {
      // when only one column dont use 6 columsn and 6 colums
      return left.map(item => {
        item.isFluid = true;
        return item;
      });
    }
    return [];
  }

  /**
   * This is just the temp solution until I can figure better way of doing this. If I want
   * e.g. 3 fields on the left and 1 field on the right. It will not work wiht current 6 column
   * layout as left and right side is not even. Even the array with empty content
   */
  private evenFields(zLeft: GroupField[], zRight: GroupField[]) {
    zLeft.sort((a, b) => a.rank - b.rank);

    if (zRight.length === 0) {
      return;
    }

    zRight.sort((a, b) => a.rank - b.rank);
    if (zLeft.length !== zRight.length) {
      const toEven = zLeft.length > zRight.length ? zRight : zLeft;
      for (let i = 0; i <= Math.abs(zLeft.length - zRight.length); i++) {
        const zone = toEven[0].zone;
        toEven.push(new GroupField(zone, `${zone}-${i}`, (toEven.length + 1)));
      }
    }
    return;
  }
}


export class GroupField {

  constructor(public zone: string, public name: string, public rank: number,
              public renderer?: TemplateRef<any>,
              public isFluid: boolean = false) {
  }
}
