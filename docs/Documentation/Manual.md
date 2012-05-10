Version Exporter Documentation
==============================

What is Version Exporter
------------------------

Version Exporter is a JavaScript application for Adobe Photoshop with general purpose to provide a workflow to export different views or versions of a single Photoshop document.

In other words Version Exporter takes every root folder (layer set) in the document and saves it as a separate image.

### Real Life Example

First let's take a real life example without Version Exporter. Say, you design a website and you want to show a dropdown in the main navigation on a separate screen, as otherwise it covers the important content on the page. So you design the website and put the layers in some folders and here is what your document structure would normally look like.

- Menu Dropdown
- Menu
- Content
- Background

What do you do now?

### Layer Comps Approach

You may create a couple Layer Comps — one for the default screen view, and one for the view with the dropdown. For this approach I see several issues, that make it impossible for me to with it.

1. You have to manually update all the comps all the time while you working on it.
2. New layers won't be included in the Comp automatically.
3. Renaming layers results into the conflicts with the comps.
4. As your document grows and gets more options, states and views, which results into the growing number of layers, you start to experience Photoshop performance issues and you get that slideshow effect even on a powerful machine.

### Manual Approach

1. You turn off (hide) the Menu Dropdown folder.
2. Press "Save As" or "Save for Web" key shortcut.
3. Choose the destination and filename, omitting that you need to think what is the current screen, figure out how to call or describe it.
4. Multiply this by the number of screen and by the number of editions

### Version Exporter Approach

Not taking into account all the additional features and the lack of all the issues of the Layer Comps approach, it is almost the same. You should just store all versions in separate folders and make a folder for the basis for all versions. After that the workflow looks like this:

1. Press a hot key to call the action, press Run
2. Done.

So let's adjust the document structure for the Version Exporter.

- Default View _(empty folder)_
- Menu Dropdown _(contains all the layers for dropdown overlay)_
- Background _(contains Menu, Content and Background folders)_

As result you get

- website\_0000_Default View.jpg Containing the merged Background, Content and Menu folders.
- website\_0001_Menu Dropdown Containing the merged Background, Content and Menu folders and the Menu Drodown on top of it.

Of course the destination and images format are adjustable in the dialog. All the settings and destinations are taken from the last usage or from a project configuration.


Installation
------------

Place the Version Exporter folder anywhere you want in the system.


Running Version Exporter
------------------------

To run Version Exporter

1. Open Photoshop
2. Click `File → Scripts → Browse…`
3. Navigate to the folder where you have installed Version Exporter
4. Choose `Version Exporter.jsx`

You might also want to record an action for that and provide it with a shortcut key for a fast access.


Basic Export (draft)
--------------------

![Basic Functionality](https://img.skitch.com/20120509-pqqpgs9555781b4kuiwf1b1pup.png)

Version Exporter works in a copy of the document, so there is no way it can influence you source document.

### Special cases

* The folders will be "merged" with the Background folder only if there is one.
* If there is a Background _layer_ it will be treated as a background folder. The layer is considered background if it is actually set as a background layer for the document or if its name is "Background".
* Every stand alone layer in the root of the document will be treated as a separate version and will be exported as if it was a folder containing only this particular layer. 

Excluding
---------

You can easily exclude folders from export. Assign gray color to a folder to tell Version Exporter to ignore it. Only the color of the root level folder matters. Color on the contained layers and folders don't.

This won't affect Background folder, as it doesn't get exported as a single version.

Ignoring folders will affect the numbering of the files. The number of the file increments only for the actually exported images.

![Disabled Folder](https://img.skitch.com/20120509-ch76efrk71856knq17hc1ktrdm.png)

Smart Folders (unfinished)
------------

Smart Folders allow you to combine different folders and export it as a separate version. Smart Folders are exported without the Background folder. This can be useful if:

* you have 5 versions of main navigation and yet 3 versions of a sidebar and your client wants to have _every_ of the 15 options on a separate screen
* you want alternative background for some versions
* you want some modifications for some versions (see Action Layers section)

![Smart Folders](https://img.skitch.com/20120509-j3m54nsm6uxmt5eajpt3guwt48.png)

Tell Version Exporter the folder needs to be treated as Smart Folder by assigning violet color to it. Basic idea of the Smart Folders is that every layer inside them is considered a reference to another layer or folder anywhere in the document. 

![Smart Folders Explained](http://f.cl.ly/items/0402420j1f401F3T0r1K/smart_folders_explained.png)

The content of the reference layers doesn't matter as the layers will be replaced by the referenced folder. The "URL" to the reference is the name of the reference layer. You can even use nested layers or folders by using a `/` in the reference.

The Folders inside the Smart Folders are left untouched.

You can reference a Smart Folder into another Smart Folder. But in that case only the actual content of the Smart Folders without any modifications applied to the referenced Smart Folder.

Action Layers
-------------

Sometimes I had a situation when I needed to place several screens with different content in the same document. And not always that content would have the same length. Further more the difference in the length of the content is oftentimes quite noticeable. It results in quite high screens containing mostly blank space after the footer. 

So I made Action Layers. Layer will be treated as an Action Layer if it is found directly inside the Smart Folder and has the blue color assigned to it.

![Action Layers](http://f.cl.ly/items/1k2C3Q2c0J2S392T3c03/action_layers.png)

Having in mind that there might be quite a number of actions, I must say that now there is only one :) it is "crop". The syntax is dead simple.

	[function name] [params]

Syntax for the "crop" action is

	crop startX,startY,endX,endY

So if you want to crop out of you large document a smaller image which is 500px wide and 200px tall starting the crop from the left top corner.

	crop 0,0,500,200 

All 4 parameters may have value `w` or `h` which are the place holders for the width and height of the document respectively. So If you want to crop starting at top left and ending at 1000px vertically having the width uncropped, you need to name the Action Layer

	crop 0,0,w,1000 


Safari Wrap (draft)
-------------------

_Not documented yet_


Project Configuration
---------------------

_Not documented yet_


Batch Export
------------

Version Exporter identifies the dialog free mode automatically if you run it in batch processing mode. Just use `File → Automate → Batch…` as usual and keep in mind that Version Exporter will look for settings in the following order:

1. Project configuration file
2. Settings used on the last run
3. Default settings

System Requirements
-------------------

Mac or PC and Adobe Photoshop CS4 or higher.

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
