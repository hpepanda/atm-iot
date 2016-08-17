# ATM IoT System
IoT this is a hardware and software system that consists of Raspberry Pi with a set of sensors (ultrasonic, acoustic, accelerometer, RaspiCam and ordinary web-camera) connected to it and bunch of servers built on the microservice architecture which work close to each other for processing the data received from the sensors.

![Assembled IoT system](https://cloud.githubusercontent.com/assets/20835203/17626514/357df7a6-60b6-11e6-9acd-86f15dd163cd.png)

The software needed for building of IoT server can be found in this repository. All types of servers distributed through the different branches, so, for installing a specific server in generally you need to:
+ Clone the current repository to your server instance:

    ```
    git clone https://github.com/hpepanda/atm-iot.git && cd atm-iot
    ```
+ Switch the branch from master to the other branch depending what server you need:

    ```
    git checkout <server_name>
    ```

For your convenience, all the software which can be found in the current repository listed in the table below:

Server Name|Branch Name|Description
-----------|-----------|-----------
User Interface|atm-ui|The component that responsible for representation of data from all servers to the end user
Image Cleaner Server|imagecleaner|The component that deletes old unused images, saved on the hard disk while working of the system
Data Processing Server|dataprocessing|Bunch of server-side applications which are responsible for saving (to MongoDB) and processing of data that received from sensors
Image Processing Server|serverimageprocessing|The service that detects if there are people on the received image and if so then counts them
Video Stream Server|videostreamserver|The server that used for saving of video stream, received from Raspberry Pi to the special object data storage
