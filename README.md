# Grandeur

Universal code compiler and package manager for microcontrollers. Based on Arduino. Currently supports ESP8266 and ESP32 family.

## Install
Start with downloading Grandeur. The package is currently hosted on Github. Run following command into your terminal to globally install the cli
```bash
npm install https://github.com/grandeurdev/cli -g
```

## Get Started
Create a new project with `init` command. Running this command will create a new sketch folder in current working directory, containing the `ino` code file and a `package.json` file. Simplify specifiy the architecture and let Grandeur automatically handle the board dependencies.
```bash
grandeur init
```
![Init command](https://uploads-ssl.webflow.com/61b8cbd25f7bbc2678e64784/62141f310b65ce519275d6bc_init.gif)

## Manage Dependencies
Grandeur provides npm like interface and make it super easy for hardware developers to manage dependencies. To install a library from Arduino library manager, simply run this command
```bash
grandeur install <library-name>
```
Running this command wil automatically update the `package.json` file. That means, you can always restore your enviroment in another computer by running install command
```bash
grandeur install
```
## Run
To compile and upload the code to hardware, just execute `run` command in workspace folder. 
```bash
grandeur run
```
After compilation, the cli will automatically attach the board to display serial logs. Here is a demo for simple hello world code running on ESP32
```arduino
// the setup function runs once when you press reset or power the board
void setup() {
	Serial.begin(9600);
}

// the loop function runs over and over again forever
void loop() {

	Serial.println("Hello 👋");
	delay(2000);
}
        
```
![Running](https://uploads-ssl.webflow.com/61b8cbd25f7bbc2678e64784/62142531440ab853a7faa98b_demo.gif)

## Monitor
Attach to a running device with `monitor` command.
```bash
grandeur monitor
```