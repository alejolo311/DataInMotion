FROM python:3.8.3
LABEL maintainer "alejolo311 - danrocus - Vik407 " 
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y \
    && apt-get -y install apt-utils libpq-dev python3-dev \
    && apt-get autoremove -y \
    && apt-get clean all
ENV INSTALL_PATH /usr/app/static
RUN mkdir -p $INSTALL_PATH
WORKDIR $INSTALL_PATH
COPY requirements.txt .
RUN pip3 install -r requirements.txt
COPY . .

CMD ["/web/entrypoint.sh"]