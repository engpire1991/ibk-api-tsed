HOST:=localhost
PORT:=5000
TAG:=latest
PROJECT:=ibk
IMAGE=$(PROJECT)/api:$(TAG)

build:
	docker build -t $(IMAGE) -f docker/Dockerfile .

push:
	docker tag $(IMAGE) $(HOST):$(PORT)/$(IMAGE)
	docker push $(HOST):$(PORT)/$(IMAGE)
