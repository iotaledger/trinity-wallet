import Foundation
import Dispatch
import IotaKit

@objc(Iota)
class Iota: RCTEventEmitter {
  
  
  @objc func addEvent(_ name: String, location: String, callback: RCTResponseSenderBlock) -> Void {
    let result = "\(name) \(location)"
    callback([result])
  }
  @objc func address(_ seed: String, index: Int, security: Int, checksum: Bool, multithreaded: Bool, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    let address = IotaAPIUtils.newAddress(seed: seed, index: index, checksum: checksum, security: security, multithreaded: multithreaded)
    resolve([address])
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
    return nonce!
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

