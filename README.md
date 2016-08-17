# ATM IoT VideoStream Server
The VideoStream server is used for saving the data, coming from the IoT WebCam to the special object data storage for future processing or replaying. It connects to the video stream that broadcasted by Raspberry Pi through web sockets, reads the data and stores them to the destination server which is specified in the configuration file.

## Installation:
+ Clone the source code to the any place on your PC and go to the folder:

    ```
    git clone https://github.com/hpepanda/atm-iot.git && cd atm-iot
    ```
+ Make sure that the "videostreamserver" branch is active:

    ```
    git checkout videostreamserver && git status
    ```
You should see something like this in the output:

  ![Git status results](https://cloud.githubusercontent.com/assets/20835203/17737700/e981bae2-6496-11e6-9590-a337d949f019.png)

+ Install all the necessary components and dependencies:

    ```
    npm install
    ```
+ Go to the "/conf" folder. You should see the two configuration files: "localConfig.json" and "defaultConfig.json".

  The first file contains all settings that can't be configured by the "Config" server. The most interesting are the following lines:

    ```
    "mode": "<Which kind of environment is used ("development"/"production")"
    "sourceID": "<Name of the video stream source>",
    "configServerPath": "<Path to the "Config" server if it exist>"
    ```
  The second is used in case when there are no "Config" server that works together with the IoT system and contains different connection and authorization data which are usually received from the "Config" server. The most interesting are the following lines:

    ```
    "videoSources": ["ws://<IP address of the Raspberry Pi>:8084/"],
    "videoBroadcast": ["ws://<IP address of the Broadcasting server (to which connect all other clients)>:8084/"],
    "authData": {<Set of data used for authorization and working with object data storage>}
    ```
+ Start the "VideoStream" server:

    ```
    npm start
    ```
If the server works fine you should see the following output messages:

*Screenshot*
