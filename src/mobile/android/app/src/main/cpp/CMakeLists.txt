# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.4.1)

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.

add_library( # Sets the name of the library.
        jsc-garbage-collector

        # Sets the library as a shared library.
        SHARED

        # Provides a relative path to your source file(s).
        JSCGarbageCollector.cpp
        )

include_directories(${CMAKE_SOURCE_DIR}/../../../../../node_modules/jsc-android/dist/include)
include_directories(${CMAKE_SOURCE_DIR}/../../../../../node_modules/react-native/ReactCommon)

add_library(libjsc
        SHARED
        IMPORTED)

add_library(libjsiexecutor
        SHARED
        IMPORTED
)

set_target_properties( # Specifies the target library.
        libjsc

        # Specifies the parameter you want to define.
        PROPERTIES IMPORTED_LOCATION

        # Provides the path to the library you want to import.
        ${CMAKE_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}/libjsc.so )

set_target_properties(
        libjsiexecutor

        PROPERTIES IMPORTED_LOCATION
        ${CMAKE_SOURCE_DIR}/../../../intermediates/exploded-aar/org.webkit/android-jsc/r174650/jni/${ANDROID_ABI}/libjsc.so
)

# Specifies libraries CMake should link to your target library. You
# can link multiple libraries, such as libraries you define in this
# build script, prebuilt third-party libraries, or system libraries.

target_link_libraries( # Specifies the target library.
        jsc-garbage-collector

        libjsc

        # Links the target library to the log library
        # included in the NDK.
        )