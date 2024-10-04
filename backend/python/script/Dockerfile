# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app/

# Install Flask
RUN pip install --no-cache-dir Flask

# Create the directory for file uploads
RUN mkdir -p /home/data

# Make port 8888 available to the world outside this container
EXPOSE 8888

# Define environment variable
ENV FLASK_APP=app.py

# Run app.py when the container launches
CMD ["python", "script.py"]
