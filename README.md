Swig for Ender
==============

Swig is a fast template engine inspired by django-t (also known as Twig for Symfony's users).

It's written by [Paul Armstrong](https://github.com/paularmstrong) and can be found [here](https://github.com/paularmstrong/swig).

Installation
------------

If you don't already have installed [Ender](http://ender.no.de), go get it! Now. It's good for you.

    $ sudo npm install ender -g

Then make your build with Swig included:

    $ ender build ... ender-swig

Or add it to an existing build:

    $ ender add ender-swig

You could ask yourself "Why the fuck should I type `add ender-swig` and not simply `add swig` ?". It's a good question:

 * First, the `swig` module you'll find in npm repository is not fully browser-compatible, it will include the `node` version to your build. Not cool for your Ender build.
 * The clean way is to call `make browser` from Swig repository, then build this into ender. That's what this module has made for you.
 * Note that I may find a way using a properly written `ender.js` to make it ender-ready, and then I'll make a Pull Request to original repository. You'll know when it happens because there will be a huge warning in front of this README.

Usage
-----

This module adds a `$.render` method, and a `$.swig` object.

`$.swig` is a simple copy of the `swig` object. See Swig's documentation for more information.

The `render` method adds some magic to ease integration of inline templates (in `<script>` tags):

### Simple rendering

You can call `$.render(id, [vars])` to render an inline template. The module will take care of retrieving content and pre-compiling it for you.

```html
<script type="text/html" id="tpl">
Hello, {{ name }}.
</script>
```

```javascript
console.log($.render('tpl', {"name": "dude"}))
// Hello, dude.
```

### Support for inheritance

In this example, note that you didn't have to compile `parent` template. In a normal situation you would have had to, but the module detects extensions and tries to compile associated inline template.

```html
<script type="text/html" id="parent">
Hello, {% block name %}John Doe{% endblock %}.
</script>
<script type="text/html" id="child">
{% extends 'parent' %}
{% block name %}dude{% endblock %}
</script>
```

```javascript
console.log($.render('child'))
// Hello, dude.
```

### Support for strings

You can also render templates directly from strings, but you'll then have to provide a fake filename by passing a third parameter to `$.render`.

```html
<script type="text/html" id="child">
{% extends 'parent' %}
{% block name %}dude{% endblock %}
</script>
```

```javascript
// compile parent from string
$.render('Hello, {% block name %}John Doe{% endblock %}.', {}, 'parent')
// compile child from inline template
console.log($.render('child'))
// Hello, dude.
```
