# Research Report

## Deploying a Full-Stack Docker Application on UW-Madison CS VMs

### Summary of Work

<!--One paragraph summary of the research being performed-->

I researched how to deploy a full-stack web application (our stock-trading simulator project) onto the UW–Madison CS Linux VM using Docker and Docker Compose. This included learning how to authenticate to GitLab using SSH keys, clone the project onto the VM, understand how rootless Docker works on the instructional servers, troubleshoot docker compose daemon issues, configure environment variables, build containers on the VM, and run the entire system remotely. I followed documentation, command-line guides, and various troubleshooting resources to get the deployment fully working on the VM.

### Motivation

<!--Explain why you felt the need to perform this research-->

Our team project needs to run on the instructional VMs for demos, grading, and development. Because our application uses Docker containers (frontend, backend, database), we needed to understand how to deploy a multi-container system in an environment that uses rootless Docker and has restricted permissions (no sudo). Deploying the application successfully also ensures the team can debug and iterate quickly without relying on local machines.

### Time Spent

<!--Explain how your time was spent-->

~60 minutes learning SSH keys, GitLab authentication, and cloning to the VM

~30 minutes learning rootless Docker on the CS VMs and how Docker Compose behaves differently

~30 minutes debugging errors (docker.sock issues, missing .env, auth failures, port bindings)

~30 minutes building the images on the VM and verifying services run correctly

### Results

<!--Explain what you learned/produced/etc. This section should explain the important things you learned so that it can serve as an easy reference for yourself and others who could benefit from reviewing this topic. Include your sources as footnotes. Make sure you include the footnotes where appropriate e.g [^1]-->

I began by researching how UW’s CS VMs handle Git authentication. The VMs do not allow password-based Git cloning over HTTPS, so SSH keys were required. I learned that the full public key, including the ssh-ed25519 prefix and the email suffix—must be copied into GitLab’s SSH settings
. Once added, I successfully cloned the project using the SSH URL.

Next, I researched how Docker works on the CS servers. Unlike typical environments, the VMs use rootless Docker, meaning:
- No sudo is available
- Docker runs under the user's own systemd unit
- Commands must use docker compose

I confirmed the daemon was running using:

systemctl --user status docker

Once Docker was active, I attempted to bring the application up. I learned that Docker Compose fails if required environment files like .env are missing, so I created one modeled after the example in GitLab. After adding the file, docker compose up --build -d successfully built and started the containers. I researched how our multi-stage Dockerfiles behave on a Linux VM—this included understanding how Gradle builds inside the container, Node builds the frontend, and how port forwarding works in a rootless environment. After all images were built, I verified the containers using:

docker ps

The final task was validating that the backend and frontend responded correctly on VM-visible ports. I learned that rootless Docker exposes ports to the VM, so I used:

Through this process I now understand:

- How SSH key auth works for GitLab
- How to clone, build, and deploy Docker apps on CS VMs
- How to troubleshoot missing env files and daemon errors
- How Docker Compose behaves in a rootless environment
- How to check logs

This research allows our entire team to replicate deployment quickly and reliably once I finish my research.

### Sources

<!--list your sources and link them to a footnote with the source url-->

- Docker UW CS Page[^1]
- Rootless Docker[^2]
- ChatGPT[^3]


[^1]: https://csl.cs.wisc.edu/docs/csl/docker/
[^2]: https://docs.docker.com/engine/security/rootless/
[^3]: https://chatgpt.com/

