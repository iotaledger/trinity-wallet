#include <jni.h>
#include <JSBase.h>
#include "JSCGarbageCollector.h"

extern "C" {
JNIEXPORT void JNICALL Java_org_iota_mobile_GarbageCollectorInterface_runGC
        (JNIEnv * env, jclass thiz, jlong jctx) {
    JSGarbageCollect(reinterpret_cast<JSContextRef>(&jctx));
}
}

