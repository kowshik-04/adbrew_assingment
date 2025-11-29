# Dockerfile (app + api image)
FROM python:3.8

# Use bash as /bin/sh
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install small set of base packages we need
RUN apt-get -y update \
 && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    wget \
    gnupg \
    build-essential \
    git \
    nano \
 && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS 16) and Yarn via npm
# (We install Yarn with npm rather than apt to avoid distro apt-repo issues)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
 && apt-get -y update \
 && apt-get install -y --no-install-recommends nodejs \
 && npm install -g yarn \
 && node -v && npm -v && yarn -v \
 && rm -rf /var/lib/apt/lists/*

# Upgrade pip tools
RUN python -m pip install --upgrade pip setuptools wheel

# Environment
ENV ENV_TYPE=staging
ENV MONGO_HOST=mongo
ENV MONGO_PORT=27017
ENV PYTHONPATH=$PYTHONPATH:/src/

# Install Python deps for backend
WORKDIR /src/rest
COPY src/rest/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Copy full source
WORKDIR /src
COPY src /src

# Expose common ports used during development
EXPOSE 8000 3000

# Default entry (can be overridden by docker-compose for app vs api)
CMD ["sh", "-c", "cd /src/rest && python manage.py runserver 0.0.0.0:8000"]
