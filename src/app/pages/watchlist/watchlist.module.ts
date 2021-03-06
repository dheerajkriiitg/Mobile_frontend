import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WatchlistPageRoutingModule } from './watchlist-routing.module';

import { WatchlistPage } from './watchlist.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { BuySellPage } from './buy-sell/buy-sell.page';
import { DoubleTapDirective } from './double-tap.directive';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WatchlistPageRoutingModule,
    SuperTabsModule,
    SharedModule,
  ],
  declarations: [WatchlistPage, BuySellPage,DoubleTapDirective]
})
export class WatchlistPageModule {}
