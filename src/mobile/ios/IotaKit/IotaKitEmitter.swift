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

