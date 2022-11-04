# RxInfer Website

This repository contains all the content necessary for proper rendering of the [RxInfer](https://github.com/biaslab/RxInfer.jl) package website.

# Installation

## Prerequisites

You need to have [Hugo](https://gohugo.io) static site generator installed and working. More information might be found at [Hugo Installation Guide](https://gohugo.io/overview/installing/).

Please install Hugo **v0.105.0+extended** or newer. Note also that the build requires the extended version of Hugo (important for Windows users).Otherwise certain sections of the website won't be generated.

## Local build

1. Clone this repository and step into the directory:

        git clone git@github.com:biaslab/rxinfer-website.git 
        cd ./rxinfer-website

2. Initialise the theme git submodule:

        git submodule update --init --recursive

3. To build and server the interactive version of the website run:

        hugo server

More information on adding content can be found in the Hugo documentation in [Content](https://gohugo.io/content/organization/) and [Getting Started](https://gohugo.io/overview/quickstart/) sections.