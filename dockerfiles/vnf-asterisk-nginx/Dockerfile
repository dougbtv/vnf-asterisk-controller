FROM nginx:latest
MAINTAINER @dougbtv
ENV BUILD_DATE 2017-05-23
RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y git
# Hrmmm to build from the lab I needed
# env GIT_SSL_NO_VERIFY=true
RUN git clone https://github.com/dougbtv/vnf-asterisk-controller.git vac
ADD nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]