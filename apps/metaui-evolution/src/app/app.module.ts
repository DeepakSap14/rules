import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {HtmlWayFormComponent} from './html-way-form/html-way-form.component';
import {ComponentWayFormComponent} from './component-way-form/component-way-form.component';
import {MetauiWayFormComponent} from './metaui-way-form/metaui-way-form.component';
import {MetauiWayForm2Component} from './metaui-way-form2/metaui-way-form2.component';
import {AppRoutingModule} from './app-routing.module';
import {MetauiWayModuleComponent} from './metaui-way-module/metaui-way-module.component';
import {SalesGraphComponent} from './metaui-way-module/sales-graph/sales-graph.component';
import {
  ProductContentComponent
} from './metaui-way-module/product-content/product-content.component';
import {SourcesComponent} from './metaui-way-module/sources/sources.component';
import * as userRules from './user-rules';

import {PanelModule} from 'primeng/panel';
import {CodeHighlighterModule} from 'primeng/codehighlighter';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MetauiWayNestingComponent} from './metaui-way-nesting/metaui-way-nesting.component';
import {AribaComponentsModule, PrimeNgRulesModule} from '@ngx-metaui/primeng-rules';
import {MetaConfig, MetaUIRulesModule} from '@ngx-metaui/rules';


@NgModule({
  declarations: [
    AppComponent,
    HtmlWayFormComponent,
    ComponentWayFormComponent,
    MetauiWayFormComponent,
    MetauiWayForm2Component,
    MetauiWayModuleComponent,
    SalesGraphComponent,
    ProductContentComponent,
    SourcesComponent,
    MetauiWayNestingComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    AribaComponentsModule,
    MetaUIRulesModule.forRoot({}),
    PrimeNgRulesModule.forRoot(),
    CodeHighlighterModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    PanelModule
  ],
  entryComponents: [
    HtmlWayFormComponent,
    ComponentWayFormComponent,
    MetauiWayFormComponent,
    MetauiWayForm2Component,
    MetauiWayModuleComponent,
    SalesGraphComponent,
    ProductContentComponent,
    SourcesComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private config: MetaConfig) {
    // mandatory - you need to register user's defined rules and types since there is no
    // introspection in js

    const rules: any[] = config.get('metaui.rules.user-rules') || [];
    rules.push(userRules);
    config.set('metaui.rules.user-rules', rules);


  }

}
