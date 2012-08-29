Version Exporter Documentation
==============================

Version Exporter is a JavaScript application for Adobe Photoshop with general purpose to provide a workflow for exporting different views or versions of a single Photoshop document.

It is an advanced version of familiar 'Layers to Files' and 'Comps to Files' scripts from the original Photoshop package.

![Main Window](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Main%20Window.png)

Real Life Example
-----------------

First let's take a real life example without Version Exporter. Say, you design a website and you want to show a dropdown in the main navigation on a separate screen, as otherwise it covers the important content on the page. So you design the website and put the layers in some folders and here is what your document structure would normally look like.

- Menu Dropdown
- Menu
- Content
- Background

What do you do now?

Manual Approach
---------------

1. You turn off (hide) the Menu Dropdown folder.
2. Press "Save As" or "Save for Web" key shortcut.
3. Choose the destination and filename, omitting that you need to think what is the current screen, figure out how to call or describe it.
4. Multiply this by the number of screens and by the number of editions.

Version Exporter Approach
-------------------------

You may create a couple Layer Comps — one for the default screen view, and one for the view with the dropdown.

*or*

You keep the *overlays* and the basis common for all versions in different layer sets (or folders).

In both cases that the workflow looks like follows:

1. Press a hot key to call the action, press Run
2. Done.

There are several features that make Version Exporter irreplaceable must-have tool for every designer.

Features
--------

- Saves and names images automatically
- Allows to export to several images formats
- Wraps screens in Safari window completely adjustable including transparent background and window shadow
- Manages different dimensions for each version of a single document
- Allows to setup settings for large multi-document projects
- Remembers settings for each particular document


Installation
============

Place the Version Exporter folder anywhere you want in the system.


Running Version Exporter
========================

To run Version Exporter

1. Open Photoshop
2. Click `File → Scripts → Browse…`
3. Navigate to the folder where you have installed Version Exporter
4. Choose `Version Exporter.jsx`

You might also want to record an action for that and provide it with a shortcut key for a fast access.

Document Setup: Layer Comps Approach *(draft)*
====================================

_Still needs to be documented_

Basic Export *(draft)*
--------------------
The basic functionality is pretty similar to the famous "Layer Comps to Layers". Version Exporter cycles through your comps and saves each comp as separate file.

Version Exporter works in a copy of the document, so there is no way it can influence you source document. Except for writing down the settings you choose into the "instructions" metadata field of the document. The original contents of the field remains untouched. If settings were not actually changed, the original document won't be changed, so you don't loose the "saved" state.

Excluding Comps
--------------------
_Not implemented yet_

Actions *(draft)*
-----------------

Actions are basically the additional export parameters you can add to each particular version. The actions are added to the comment field of the comp. To differ the actions from any other content of the comment field, an `@` symbol is added as the first character of the line. So if the line starts with the `@`, it is treated as an action.

Having in mind that there might be quite a number of actions, I must say that now there is only one :) it is "crop". The syntax is dead simple.

	@function params

Syntax for the "crop" action is

	@crop startX,startY,endX,endY

So if you want to crop out of you large document a smaller image which is 500px wide and 200px tall starting the crop from the left top corner.

	@crop 0,0,500,200

All 4 parameters may have value `w` or `h` which are the place holders for the width and height of the document respectively. So If you want to crop starting at top left and ending at 1000px vertically having the width uncropped, you need to name the Action Layer

	@crop 0,0,w,1000

You may also crop by a certain area. Create a layer, give it any name, say, `Crop Layer`, and fill some area with color. Now give a comp the following comment:

	@crop area Crop Area

This action will crop everything inside the bounding box of the `Crop Layer`. The visibility of the layer doesn't matter. It may even reside in nested layer sets. In this case just use the URL style path:

	@crop area Service/Crops/Crop Viewport

Where `Service` is a name of the layer set, `Crops` is a layerset inside `Service` and `Crop Viewport` is an actual layer with filled area:

![Layer Comps Actions](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Comps%20Actions.png)

Document Setup: Layer Set Approach
==================================

Basic Export *(draft)*
--------------------

![Basic Functionality](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Comps%20Actions.png)

Version Exporter works in a copy of the document, so there is no way it can influence you source document. Additional information on that see in chapter Document Setup: Layer Comps Approach.

### Special cases

* The folders will be "merged" with the Background folder only if there is one.
* If there is a Background _layer_ it will be treated as a background folder. The layer is considered background if it is actually set as a background layer for the document or if its name is "Background".
* Every stand alone layer in the root of the document will be treated as a separate version and will be exported as if it was a folder containing only this particular layer.

Excluding
---------

You can easily exclude folders from export. Assign gray color to a folder to tell Version Exporter to ignore it. Only the color of the root level folder matters. Color on the contained layers and folders doesn't.

This won't affect Background folder, as it doesn't get exported as a single version.

Ignoring folders will affect the numbering of the files. The number of the file increments only for the actually exported images.

![Disabled Folder](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Layer%20Sets%20Disable.png)

Smart Folders *(draft)*
------------

Smart Folders allow you to combine different folders and export it as a separate version. Smart Folders are exported without the Background folder. This can be useful if:

* you have 5 versions of main navigation and yet 3 versions of a sidebar and your client wants to have _every_ of the 15 options on a separate screen
* you want alternative background for some versions
* you want some modifications for some versions (see Action Layers section)

![Smart Folders](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Layer%20Sets%20Smart%20Folders%202.png)

Tell Version Exporter the folder needs to be treated as Smart Folder by assigning violet color to it. Basic idea of the Smart Folders is that every layer inside them is considered a reference to another layer or folder anywhere in the document.

![Smart Folders Explained](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Layer%20Sets%20References.png)

The content of the reference layers doesn't matter as the layers will be replaced by the referenced folder. The "URL" to the reference is the name of the reference layer. You can even use nested layers or folders by using a `/` in the reference.

The Folders inside the Smart Folders are left untouched.

You can reference a Smart Folder into another Smart Folder. But in that case only the actual content of the Smart Folders without any modifications applied to the referenced Smart Folder.

Action Layers
-------------

Sometimes I had a situation when I needed to place several screens with different content in the same document. And not always that content would have the same length. Further more the difference in the length of the content is oftentimes quite noticeable. It results in quite high screens containing mostly blank space after the footer.

So I made Action Layers. Layer will be treated as an Action Layer if it is found directly inside the Smart Folder and has the blue color assigned to it.

![Action Layers](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Layer%20Sets%20Actions.png)

Having in mind that there might be quite a number of actions, I must say that now there is only one :) it is "crop". The syntax is dead simple.

	[function name] [params]

Syntax for the "crop" action is

	crop startX,startY,endX,endY

So if you want to crop out of you large document a smaller image which is 500px wide and 200px tall starting the crop from the left top corner.

	crop 0,0,500,200

All 4 parameters may have value `w` or `h` which are the place holders for the width and height of the document respectively. So If you want to crop starting at top left and ending at 1000px vertically having the width uncropped, you need to name the Action Layer

	crop 0,0,w,1000

You may also create an action layer and fill a certain area in it with a plain color. The color doesn't matter. Document will be cropped to the filled area. This layer can stay hidden all the time, and has to be named as follows:

	crop area


Safari Wrap *(draft)*
===================

_Still needs to be documented_

![Safari Wrap](https://raw.github.com/amtvsn/Version-Exporter/master/docs/Documentation/Images/Wrap%20Safari.png)

In short it wraps the image with Safari window. The resulting screen looks about 100% the same as the screenshot you would capture from original Mac OS (Lion).

The window gets adjusted to the size of the source image automatically. The screen includes shadow, rounded corners, custom window title and custom URL. If you save it as a PNG or PSD file the transparency of the shadow remains. If you choose another format, you may specify the color of the background behind the window.


Project Configuration
=====================

Configuration file helps you reuse same settings for each specific project you are working on. It is also useful for automatic batch exporting with "No Dialog" mode turned on.

Generally the configuration is a JSON data stored in a `.conf` file.

The contents of the file is an array:

	[]

Let's insert a *docuemnt* into our *docuemnt array*:

	[
		{
			// docuemnt
		}
	]

Each document is an object in the JavaScript terminology. Let me show you an example:

	[
		{
			"exportInfo": {
				"destination": "../../Screens/Evaluation",
			}
		}
	]

This configuration will tell Version Exporter to export all the screens to the path `../../Screens/Evaluation` taking it relative to currently open document.

You may override all these settings from the main window.

Let's say you want different documents to be exported in different locations. Add the *filename* parameter:

	[
		{
			"filename": "foo.psd",
			"exportInfo": {
				"destination": "../../Screens/foo",
			}
		},

		{
			"filename": "bar.psd",
			"exportInfo": {
				"destination": "../../Screens/bar",
			}
		}
	]

Let's add some more options:

	[
		{
			"filename": "foo.psd",
			"exportInfo": {
				"destination": "../../Screens/foo",
				"safariWrap": true,
				"trim": true,
			}
		},

		{
			"filename": "bar.psd",
			"exportInfo": {
				"destination": "../../Screens/bar",
				"safariWrap": true,
				"trim": true,
			}
		}
	]

Next it tells to set a checkbox for *Safari Wrap*. The *trim* option tells the script to trim transparent pixels from the image before wrapping or saving it. Add some settings for *Safari Wrap*:


	[
		{
			"filename": "foo.psd",
			"exportInfo": {
				"destination": "../../Screens/foo",
				"safariWrap": true,
				"trim": true,
			},
			"SafariWrap": {
				"backgroundColor": "#999999",
				"windowTitle": "Sample Project",
				"url": "http://www.sample.com"
			},
		},

		{
			"filename": "bar.psd",
			"exportInfo": {
				"destination": "../../Screens/bar",
				"safariWrap": true,
				"trim": true,
			},
			"SafariWrap": {
				"backgroundColor": "#999999",
				"windowTitle": "Sample Project",
				"url": "http://www.sample.com"
			},
		}
	]

So the configuration starts to grow with the number of your documents. I had some projects with configuration about 1000 lines. So I made the *extend* feature and made it contain about 200 lines. *Extend* option allows you to inherit some of the properties from another document.

	[
		{
			"filename": "foo.psd",
			"exportInfo": {
				"destination": "../../Screens/foo",
				"safariWrap": true,
				"trim": true,
			},
			"SafariWrap": {
				"backgroundColor": "#999999",
				"windowTitle": "Sample Project",
				"url": "http://www.sample.com"
			},
		},

		{
			"filename": "bar.psd",
			"extend": "foo.psd",
			"exportInfo": {
				"destination": "../../Screens/bar",
			},
		}
	]

Notice the *destination* path is still overriding the inherited one. Good thing is that you don't need to use actual filenames of the documents:

	[
		{
			"filename": "Base Settings",
			"exportInfo": {
				"safariWrap": true,
				"trim": true,
			},
			"SafariWrap": {
				"backgroundColor": "#999999",
				"windowTitle": "Sample Project",
				"url": "http://www.sample.com"
			},
		},
		{
			"filename": "foo.psd",
			"extend": "Base Settings",
			"exportInfo": {
				"destination": "../../Screens/foo",
			},
		},
		{
			"filename": "bar.psd",
			"extend": "Base Settings",
			"exportInfo": {
				"destination": "../../Screens/bar",
			},
		}
	]

Another good thing is that you can extend onther configuration stacks. In following example we may have several documents exported to one destination, several to another. And every group will have different Safari Wrap settings.

	[
		{
			"filename": "Export Settings",
			"exportInfo": {
				"safariWrap": true,
				"trim": true,
			},
			"SafariWrap": {
				"backgroundColor": "#999999",
			},
		},
		{
			"filename": "Company Pages",
			"extend": "Export Settings",
			"exportInfo": {
				"destination": "../../Screens/Company",
			},
			"SafariWrap": {
				"windowTitle": "Company",
				"url": "http://www.sample.com/company/"
			},
		},
		{
			"filename": "Blog Pages",
			"extend": "Export Settings",
			"exportInfo": {
				"destination": "../../Screens/Blog",
			},
			"SafariWrap": {
				"windowTitle": "Blog",
				"url": "http://www.sample.com/blog/"
			},
		},
		{ "filename": "company1.psd", 		"extend": "Company Pages" },
		{ "filename": "company_news.psd",	"extend": "Company Pages" },
		{ "filename": "blog_list.psd",		"extend": "Blog Pages" },
		{ "filename": "blog_details.psd",	"extend": "Blog Pages" },
		{ "filename": "blog_account.psd",	"extend": "Blog Pages" },
	]

If you want to extend a default configuration, you should name the default one `default` and set the `extend` option in the extending settings to `default` as well. The `default` value is a keyword for setting `filename`. It tells the script to use this configuration for all files it couldn't find specific settings for. Here is a file turning off Safari Wrap for a particular file:

	[
		{
			"filename": "default",
			"exportInfo": {
				"safariWrap": true,
				"trim": true,
			},
			"SafariWrap": {
				"backgroundColor": "#999999",
			},
		},
		{
			"filename": "iPad.psd",
			"extend": "default",
			"exportInfo": {
				"safariWrap": false,
			},
		}

	]


So where to store the configuration? You have two options.

1. You create a single configuration file, name it `Project.conf` and place in the same folder as your PSDs are in.
2. You go centeralized way.

The centeralized way is useful when you have your PSDs in different folders as the `Project.conf` works only for the very exectly same folder, there is no recursive traversing down the folder tree. So you have to do the following:

1. Go to your home folder, which is `C:\Users\user.name` on Windows 7 and `/Users/user.name` on Mac
2. Create a folder `Pro Actions`
3. Inside `Pro Actions` create file `Projects.conf`
4. Inside `Pro Actions` create folder `Projects`

Now the  `Projects.conf` file is the index of you projects. and the folder `Projects` contains the configuration files for each project.

Here is an example of contents of the `Projects.conf`:

	[
		{
			"project": "Sample Project",
			"locations": [ "~/Work/Projects/Sample Projects" ]
		},
		{
			"project": "Demo",
			"locations": [ "C:/Photoshop/Sample Projects" ]
		},
	]

So this is pretty much the same story as before. We have an array of the projects.

The *project* option defines the *file name* of the configurations file in the `Projects` folder.

The *locations* option defines the array of the locations containing the documents for this project. Notice that you can enter locations in any way you like. The *~* symbol is treated as user home. Here are some valid paths: `/C/path/to/files`, `/Users/path/to/files`, `~/Working/Blog/something/`, `d:/PATH/to/FILES`. Path has to be absolute and be careful with the `\` character. It is an escape character in JavaScript, so either use `\\` or `/` even for windows paths. On Mac computers also matters the case of the letters.

It works like this. The script checks if the currently open document in one of the listed locations. We check all of them. The first match will stop the search. We check the name of the project which contains the matching location. Let's say it's *Sample Project*. So now we take the `Sample Project.conf` from the `Projects` folder and use it as we'd use the `Project.conf` file in the folder containing the document.

So here is a live example. Say, you work on a mac, and on a PC. You have you project on Mac and mounted a shared folder onto you `D:` drive. So you have the identical contents of the 2 folders.

	/Users/me/Work/Projects/Sample Project/PSD (Mac)
	D:\Projects\Sample Project\PSD (Windows)

	foo.psd
	bar.psd

	/Users/me/Projects.conf (Mac)
	C:\Users\me\Projects.conf (Windows)

	[
		{
			"project": "Sample Project",
			"locations": [
				"~/Work/Projects/Sample Project/PSD",
				"d:/Projects/Sample Project/PSD",
			]
		}
	]

	/Users/me/Projects/Sample Project.conf (Mac)
	C:\Users\me\Projects\Sample Project.conf (Windows)

	[
		{
			"exportInfo": {
				"destination": "../Screens",
			}
		}
	]

So if you run Version Exporter it will have your `foo.psd` and `bar.psd` exported into `/Users/me/Work/Projects/Sample Project/Screens` on Mac and `D:\Projects\Sample Project\Screens` on Windows.


Batch Export
============

Version Exporter identifies the dialog free mode automatically if you run it in batch processing mode. Just use `File → Automate → Batch…` as usual and keep in mind that Version Exporter will look for settings in the following order:

1. Project configuration file
2. Settings used on the last run
3. Default settings

System Requirements
===================

Mac or PC and Adobe Photoshop CS4 or higher.

Safari Wrap works only on CS4 for now. I'm working on that.

Tested on:

- PC, Windows 7, Intel Core i5-2400 CPU @ 3.10GHz, 8 GB, Adobe Photoshop CS4
- Mac, Intel Core i5 @ 3.2GHz, 4GB, Adobe Photoshop CS4
- Mac, Intel Core i5 @ 3.2GHz, 8GB, Adobe Photoshop CS4
- Mac, Intel Core 2 Duo @ 2.4GHz, 4GB, Adobe Photoshop CS4
- Mac, Intel Core 2 Duo @ 2.4GHz, 8GB, Adobe Photoshop CS4

If you have successfully tested Version Exporter on you machine, please let me know the specs of it so I could bring this into the list.

Contact and Support
===================

If you've found any bugs or you have any questions you can

* submit an issue on [GitHub](https://github.com/amtvsn/Version-Exporter/issues)
* contact me via e-mail github@mtvsn.com
* or via skype `azukari`.
