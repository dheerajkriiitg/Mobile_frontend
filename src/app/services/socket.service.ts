import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { environment } from 'src/environments/environment';

const SERVER_URL = 'wss://streamer.cryptocompare.com';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;
  private _subscriptions=[];
  constructor() { 
    this.socket = io(environment.socketUrl);
    this.socket.on('connect', () => {
      console.log('=====Socket connected=======')
    })
    this.socket.on('disconnect', (e) => {
      console.log('=====Socket disconnected:', e +' =======')
    })
    this.socket.on('error', err => {
      console.log('====socket error', err+' =======')
    })
    this.socket.on('5fe2f6a0c47d337472943107', (e) => {
      // here we get all events the CryptoCompare connection has subscribed to
      // we need to send this new data to our subscribed charts
      console.log('socket on 5fe2f6a0c47d337472943107', e);
      const _data= e;
      if (_data[0] === "3") {
       // console.log('Websocket Snapshot load event complete')
       return
      }
      let tempTime = _data[0].time.split(":");
  let dt = new Date();
  dt.setHours(tempTime[0]);
  dt.setMinutes(tempTime[1]);
  dt.setSeconds(tempTime[2]);
      const data = {
      //  sub_type: parseInt(_data[0],10),
      //  exchange: _data[1],
      //  to_sym: _data[2],
      //  from_sym: _data[3],
      //  trade_id: _data[5],
      //  ts: parseInt(_data[6],10),
      //  volume: parseFloat(_data[7]),
      //  price: parseFloat(_data[8]),

      id: _data[0].id,
      pivot1: _data[0].pivot1,
      price: _data[0].price,
      time: _data[0].time,
      volume: _data[0].volume,
      tempTime: tempTime
      }
      
      // const channelString = `${data.sub_type}~${data.exchange}~${data.to_sym}~${data.from_sym}`
      const channelString = '5fe2f6a0c47d337472943107'
      
      const sub = this._subscriptions.find(e => e.channelString === channelString)
      
      if (sub) {
       // disregard the initial catchup snapshot of trades for already closed candles
      //  if (data.ts < sub.lastBar.time / 1000) {
      //    return
      //   }
       
     var _lastBar = this.updateBar(data, sub)
     
     // send the most recent bar back to TV's realtimeUpdate callback
       sub.listener(_lastBar)
       // update our own record of lastBar
       sub.lastBar = _lastBar
      }
     })
  }

  public initSocket(): void {
    
    
  }

  // Take a single trade, and subscription record, return updated bar
updateBar(data, sub) {
  //alert('update bar from socket service ');
  var lastBar = sub.lastBar
  let resolution = sub.resolution
  if (resolution.includes('D')) {
   // 1 day in minutes === 1440
   resolution = 1440
  } else if (resolution.includes('W')) {
   // 1 week in minutes === 10080
   resolution = 10080
  }
 var coeff = resolution * 60
  // console.log({coeff})
  var lastBarDate = new Date(lastBar.time);
  var lastBarMin = lastBarDate.getMinutes();
  var rounded = Math.floor(data.time / coeff) * coeff
  var lastBarSec = lastBar.time / 1000
  var _lastBar
  
 if (data.tempTime[1] > lastBarMin) {
   let dtTimestamp = new Date(lastBar.time).toDateString();

   // create a new candle, use last close as open **PERSONAL CHOICE**
   _lastBar = {
    time: new Date(`${dtTimestamp},${data.time}`).getTime(),
    open: lastBar.close,
    high: lastBar.close,
    low: lastBar.close,
    close: data.price,
    volume: data.volume
   }
   
  } else {
   // update lastBar candle!
   if (data.price < lastBar.low) {
    lastBar.low = data.price
   } else if (data.price > lastBar.high) {
    lastBar.high = data.price
   }
   
   lastBar.volume += data.volume
   lastBar.close = data.price
   _lastBar = lastBar
  }
  //console.log('_lastBar '+JSON.stringify(_lastBar));
  return _lastBar
 }
 
 // takes symbolInfo object as input and creates the subscription string to send to CryptoCompare
 createChannelString(symbolInfo) {
   var channel = symbolInfo.name.split(/[:/]/)
   const exchange = channel[0] === 'GDAX' ? 'Coinbase' : channel[0]
   const to = channel[2]
   const from = channel[1]
  // subscribe to the CryptoCompare trade channel for the pair and exchange
  //  return `0~${exchange}~${from}~${to}`
  return '5fe2f6a0c47d337472943107'
 }
 channelString:string;
  subscribeBars(symbolInfo, resolution, updateCb, uid, resetCache,history) {
    //alert('SubscribeBars from service');
    this.channelString = this.createChannelString(symbolInfo)
    this.socket.emit('SubAdd', {subs: [this.channelString]})
    let a=this.channelString;
    var newSub = {
      "channelString":a,
    uid,
    resolution,
    symbolInfo,
    lastBar: history[symbolInfo.name].lastBar,
    listener: updateCb,
    }
    //console.log('newSub '+JSON.stringify(newSub));
  this._subscriptions.push(newSub)
  }

  unsubscribeBars(uid) {
    //alert('unsubscribe bar from socket service ');
    var subIndex = this._subscriptions.findIndex(e => e.uid === uid)
    if (subIndex === -1) {
     //console.log("No subscription found for ",uid)
     return
    }
    var sub = this._subscriptions[subIndex]
    this.socket.emit('SubRemove', {subs: [sub.channelString]})
    this._subscriptions.splice(subIndex, 1)
   }
  

}
