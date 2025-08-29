# Galatea!

This microservice handles static assets, and also allows for 'resizing' the requested images.

## Why is the word 'resize' in quotes?

Galatea does NOT resize images in runtime, instead, it does it at compile time, simmilarly to how mipmaps work in OpenGL.
You can see the result of this in production by appending ?width= or ?height= to the URL.

Images not in images/ wont be resizable.
