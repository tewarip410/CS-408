# CS-408

## How to get started
1. Create account/login to https://www.docker.com/
2. Download/install Docker
3. Make sure you open the Docker application and login (once installed) to set it up
4. Clone this repository
5. From within this directory, run `docker-compose up`
6. Go to http://localhost:8081 to check if server is running

## How docker works
When you run `docker-compose up`, docker uses `docker-compose.yml` to build a docker image. It also tells docker to use _our_ `server` directory (as opposed to the directory within the image). This allows us to use nodemon, which restarts the server whenever we make a change to a javascript file and avoids the need to remake the docker image every time we make a change.

It's important to remember this when adding files/directories outside of `/app` because the server __will not automatically restart__ when modifying files outside of `/app`.

## Starting/restarting docker
Stop: <kbd>ctrl</kbd>+<kbd>c</kbd>

Start: `docker-compose up`