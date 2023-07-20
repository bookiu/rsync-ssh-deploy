FROM nginx

ARG SSH_PUB_KEY

RUN apt update && \
    apt install openssh-server rsync sudo -y

RUN echo "PubkeyAuthentication yes" >> /etc/ssh/sshd_config.d/pub.conf && \
    echo "AuthorizedKeysFile  .ssh/authorized_keys" >> /etc/ssh/sshd_config.d/pub.conf

RUN mkdir -p /usr/share/nginx/html && \
    mkdir -p /usr/share/nginx/html/test && \
    mkdir -p /usr/share/nginx/html/test2 && \
    chmod -R 775 /usr/share/nginx/html

RUN useradd -rm -d /home/test -s /bin/bash -g root -G sudo -u 1000 test && \
    usermod -aG sudo test && \
    mkdir -p /home/test/.ssh && \
    chmod 700 /home/test/.ssh
COPY keys/authorized_keys /home/test/.ssh/authorized_keys
RUN echo "$SSH_PUB_KEY" >> /home/test/.ssh/authorized_keys && \
    chmod 600 /home/test/.ssh/authorized_keys && \
    chown -R test /home/test/.ssh

RUN useradd -rm -d /home/test2 -s /bin/bash -g root -G sudo -u 1002 test2 && \
    usermod -aG sudo test2 && \
    mkdir -p /home/test2/.ssh && \
    chmod 700 /home/test2/.ssh
COPY keys/authorized_keys /home/test2/.ssh/authorized_keys
RUN echo "$SSH_PUB_KEY" >> /home/test2/.ssh/authorized_keys && \
    chmod 600 /home/test/.ssh/authorized_keys && \
    chown -R test2 /home/test2/.ssh

RUN service ssh start

RUN echo 'test:test' | chpasswd && \
    echo 'test2:test2' | chpasswd

EXPOSE 22

ADD entrypoint.sh /docker-entrypoint.d/entrypoint.sh
RUN chmod +x /docker-entrypoint.d/entrypoint.sh


CMD ["nginx", "-g", "daemon off;"]
