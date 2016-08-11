# ATM IoT UI
The IoT UI is the part of the IoT system that responsible for representation of the data received from the server to the end user. Using this component the user can see the current state of the system (data from the sensor board, data from accelerometer, video stream etc.) and log of the events that occurred earlier:

*screen*
## Installation
+ Clone the source code to the any place on your PC and go to the folder:

    ```
    git clone https://github.com/hpepanda/atm-iot.git && cd atm-iot
    ```
+ Make sure that the "atm-ui" branch is active:

    ```
    git checkout atm-ui && git status
    ```
You should see something like this in the output:

![git status results](https://monosnap.com/file/wmXikpMN5F7Q83BG2Hbn438HtcTPv4.png)

+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
Note! Two [optional modules](https://www.npmjs.com/package/ws#opt-in-for-performance) ("bufferutil" and "utf-8-validate") which are part of the "ws" module were written on C++ and require C++ compiler for installing. So if you don't have right compiler then you will get an error while installing these two modules, but don't worry since both of them are optional and doesn't affect the operation of the application.

+ To build and run development version of the web-interface run the command:

    ```
    gulp dev
    ```
Or, to build and run production version of the web-interface run the command:

    ```
    gulp dist
    ```
+ The browser will automatically open the web interface page when the build procedure will completed.
