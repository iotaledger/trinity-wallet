import Foundation
import Dispatch
import IotaKit

@objc(Iota)
class Iota: RCTEventEmitter {
  
  
  @objc func addEvent(_ name: String, location: String, callback: RCTResponseSenderBlock) -> Void {
    let result = "\(name) \(location)"
    callback([result])
  }
  
  @objc func generateAddress(_ seed: String, index: Int, security: Int, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    let address = IotaAPIUtils.newAddress(seed: seed, index: index, checksum: false, security: security, multithreaded: true)
    resolve(address)
  }
  
  @objc func generateAddresses(_ seed: String, index: Int,  security: Int, total: Int,  resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    var addresses: [String] = []
    for i in index..<index+total {
      let address = IotaAPIUtils.newAddress(seed: seed, index: i, checksum: false, security: security, multithreaded: true)
      addresses.append(address)
    }
    resolve(addresses)
  }
  
  @objc func doPoW(_ trytes: String, minWeightMagnitude: Int, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    let result = PearlDiverLocalPoW().performPoW(trytes: trytes, minWeightMagnitude: minWeightMagnitude)
    let resultNonce = nonce(fromTrytes: result)
    resolve(resultNonce)
  }
  func nonce(fromTrytes trytes: String) -> String {
    let start = trytes.index(trytes.startIndex, offsetBy: 2646)
    let end = trytes.index(start, offsetBy: 27)
    let nonce = String(trytes[start ..< end])
    return nonce
  }
  override func supportedEvents() -> [String]! {
    return ["Hello"]
  }
  @objc override func constantsToExport() -> Dictionary<AnyHashable, Any> {
    return [
      "a": "A",
      "b": "B"
    ];
  }
}
