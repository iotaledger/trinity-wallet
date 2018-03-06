//
//  iotaWalletUITests.swift
//  iotaWalletUITests
//
//  Created by Rajiv Shah on 1/25/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import XCTest

class iotaWalletUITests: XCTestCase {
        
    override func setUp() {
      super.setUp()
      let app = XCUIApplication()
      continueAfterFailure = false
      setupSnapshot(app)
      app.launch()
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
    
    func testOnboarding() {
        // Use recording to get started writing UI tests.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
      
      let app = XCUIApplication()
      waitForElementToAppear(app/*@START_MENU_TOKEN@*/.otherElements["languageSetup-next"]/*[[".otherElements.matching(identifier: \"Language English (International) English (International) NEXT\")",".otherElements.matching(identifier: \"NEXT\").otherElements[\"languageSetup-next\"]",".otherElements[\"languageSetup-next\"]"],[[[-1,2],[-1,1],[-1,0,1]],[[-1,2],[-1,1]]],[0]]@END_MENU_TOKEN@*/)
      snapshot("languageSetup")
      app/*@START_MENU_TOKEN@*/.otherElements["languageSetup-next"]/*[[".otherElements.matching(identifier: \"Language English (International) English (International) NEXT\")",".otherElements.matching(identifier: \"NEXT\").otherElements[\"languageSetup-next\"]",".otherElements[\"languageSetup-next\"]"],[[[-1,2],[-1,1],[-1,0,1]],[[-1,2],[-1,1]]],[0]]@END_MENU_TOKEN@*/.tap()
      snapshot("welcome")
      app/*@START_MENU_TOKEN@*/.otherElements["welcome-next"]/*[[".otherElements.matching(identifier: \"Thank you for downloading the IOTA wallet. We will spend the next few minutes setting up your wallet. You may be tempted to skip some steps, but we urge you to follow the complete process. NEXT\")",".otherElements.matching(identifier: \"NEXT\").otherElements[\"welcome-next\"]",".otherElements[\"welcome-next\"]"],[[[-1,2],[-1,1],[-1,0,1]],[[-1,2],[-1,1]]],[0]]@END_MENU_TOKEN@*/.tap()
      snapshot("walletSetup")
      app/*@START_MENU_TOKEN@*/.otherElements["walletSetup-no"]/*[[".otherElements.matching(identifier: \"Okay. Let's set up your wallet! Do you already have a seed that you would like to use? The IOTA seed is like a username and password to your account, combined into one string of 81 characters. You can use it to access your funds from any wallet, on any device. But if you lose your seed, you also lose your IOTA. Please keep your seed safe. NO YES\")",".otherElements.matching(identifier: \"NO YES\")",".otherElements[\"NO\"]",".otherElements[\"walletSetup-no\"]"],[[[-1,3],[-1,2],[-1,1,2],[-1,0,1]],[[-1,3],[-1,2],[-1,1,2]],[[-1,3],[-1,2]]],[0]]@END_MENU_TOKEN@*/.tap()
      app.otherElements["newSeedSetup-newSeed"].tap()
      snapshot("newSeedSetup")
      app.otherElements["newSeedSetup-back"].tap()
      app.otherElements["walletSetup-yes"].tap()
      app.otherElements["enterSeed-seedbox"].tap()
      // Test seed: KSUUIG9JAANHNZVHRCKKUPHAEPDNJXPIUF9SHYTOYXYXEKJNENKOBXL9NEWJEPUUPPXSUVFRLRLZMUNKG
      // Checksum: Z9C
      app.otherElements["enterSeed-seedbox"].typeText("KSUUIG9JAANHNZ")
      sleep(3)
      app.otherElements["enterSeed-seedbox"].typeText("VHRCKKUPHAEPDNJXPIU")
      sleep(3)
      app.otherElements["enterSeed-seedbox"].typeText("F9SHYTOYXYXEKJNEN")
      sleep(3)
      app.otherElements["enterSeed-seedbox"].typeText("KOBXL9NEWJEPUUPPXSUVFRLRLZMUNKG")
      sleep(3)
      XCTAssert(app/*@START_MENU_TOKEN@*/.staticTexts["Z9C"]/*[[".otherElements.matching(identifier: \"SEED Z9C Seeds should be 81 characters long, and should contain capital letters A-Z, or the number 9. You cannot use seeds longer than 81 characters. \\nNEVER SHARE YOUR SEED WITH ANYONE BACK NEXT\")",".otherElements[\"SEED Z9C Seeds should be 81 characters long, and should contain capital letters A-Z, or the number 9. You cannot use seeds longer than 81 characters. \\nNEVER SHARE YOUR SEED WITH ANYONE\"]",".otherElements[\"Z9C\"]",".staticTexts[\"Z9C\"]",".staticTexts[\"enterSeed-checksum\"]"],[[[-1,4],[-1,3],[-1,2,3],[-1,1,2],[-1,0,1]],[[-1,4],[-1,3],[-1,2,3],[-1,1,2]],[[-1,4],[-1,3],[-1,2,3]],[[-1,4],[-1,3]]],[1]]@END_MENU_TOKEN@*/.exists)
      snapshot("enterSeed")
      app/*@START_MENU_TOKEN@*/.keyboards.buttons["Done"]/*[[".keyboards.buttons[\"Done\"]",".buttons[\"Done\"]"],[[[-1,1],[-1,0]]],[1]]@END_MENU_TOKEN@*/.tap()
      sleep(3)
      if app.otherElements["enterSeed-seedbox"].exists {
        app.otherElements["enterSeed-seedbox"].typeText("\n")
      }
      sleep(3)
      snapshot("setSeedName")
      app.otherElements["setSeedName-done"].tap()
      app.otherElements["setPassword-passwordbox"].tap()
      // Test password: trinitytest1
      app.otherElements["setPassword-passwordbox"].typeText("trinity")
      sleep(1)
      app.otherElements["setPassword-passwordbox"].typeText("test1")
      app.keyboards.buttons["Next"].tap()
      app.otherElements["setPassword-reentrybox"].typeText("trinity")
      sleep(1)
      app.otherElements["setPassword-reentrybox"].typeText("test1")
      snapshot("setPassword")
      app.keyboards.buttons["Done"].tap()
      sleep(1)
      snapshot("onboardingComplete")

  }
  func waitForElementToAppear(_ element: XCUIElement) {
    let existsPredicate = NSPredicate(format: "exists == true")
    expectation(for: existsPredicate, evaluatedWith: element, handler: nil)
    waitForExpectations(timeout: 15, handler: nil)
  }
    
}
