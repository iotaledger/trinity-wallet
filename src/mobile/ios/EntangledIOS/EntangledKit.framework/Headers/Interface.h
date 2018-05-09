//
//  Interface.h
//  
//
//  Created by Rajiv Shah on 4/13/18.
//


#ifndef Interface_h
#define Interface_h

char* doPOW(const char* trytes, int mwm);
char* generateAddress(const char* seed, const int index, const int security);
char* generateSignature(const char* seed, const int index, const int security, const char* bundleHash);

#endif /* Interface_h */
