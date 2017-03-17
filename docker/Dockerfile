FROM node:7.7
MAINTAINER @dougbtv
RUN npm install -g grunt nodeunit nodemon
RUN mkdir /vac/
RUN git clone https://github.com/dougbtv/vnf-asterisk-controller.git
WORKDIR /vac/
RUN npm install
CMD /bin/bash