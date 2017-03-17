FROM node:7.7
MAINTAINER @dougbtv
RUN npm install -g grunt nodeunit nodemon
RUN git clone https://github.com/dougbtv/vnf-asterisk-controller.git vac
WORKDIR /vac/
RUN npm install &> /dev/null
CMD /bin/bash