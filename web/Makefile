AZURE_CONTAINER_REGISTRY=ocllmbotcontainerregistry

docker-run:
	@docker build -t pw-web .
	@docker run -it -p 3000:3000 --env-file=.env pw-web

docker-run-localy:
	@docker build -f Dockerfile.local -t pw-web .
	@docker run -it -p 3000:5173 -v "$(shell pwd)":/app -v /app/node_modules --env-file=.env pw-web

push-dev:
	@bash ../scripts/check_branch_up_to_date.sh staging
	@cp ../db/prisma/schema.prisma schema.prisma
	@az acr login --name ${AZURE_CONTAINER_REGISTRY}
	@az acr build --registry ${AZURE_CONTAINER_REGISTRY} --image web:dev-latest .
	@rm schema.prisma

push-qa:
	@bash ../scripts/check_branch_up_to_date.sh qa
	@cp ../db/prisma/schema.prisma schema.prisma
	@az acr login --name ${AZURE_CONTAINER_REGISTRY}
	@az acr build --registry ${AZURE_CONTAINER_REGISTRY} --image web:qa-latest .
	@rm schema.prisma

push-prod:
	@bash ../scripts/check_branch_up_to_date.sh main
	@cp ../db/prisma/schema.prisma schema.prisma
	@az acr login --name ${AZURE_CONTAINER_REGISTRY}
	@az acr build --registry ${AZURE_CONTAINER_REGISTRY} --image web:prod-latest .
	@rm schema.prisma
