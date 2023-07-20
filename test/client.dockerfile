FROM node:20

RUN apt update && \
    apt-get install -y openssh-client rsync sudo curl

WORKDIR /root

COPY index.js package.json package-lock.json /root/
COPY test.sh /root/test.sh
COPY keys /root/keys/

RUN yarn install

RUN chmod +x /root/test.sh

CMD ["/root/test.sh"]
