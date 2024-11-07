import os

# Set the frame rate of your video here
frame_rate = 30  # Change this to match your video's frame rate

# Get video duration
from moviepy.editor import VideoFileClip
input_video = VideoFileClip("notion_video.mp4")
video_duration = input_video.duration
input_video.close()

# Loop through video duration in 5 minute increments
current_time = 0
while current_time <= video_duration:
    # Format timestamp for ffmpeg
    hh = int(current_time // 3600)
    mm = int((current_time % 3600) // 60)
    ss = int(current_time % 60)
    timestamp = f"{hh:02}:{mm:02}:{ss:02}"
    
    # Generate output filename based on minutes
    # total_minutes = int(current_time / 60)
    output_file = f"{timestamp.replace(':', '-')}.png"
    
    # Extract frame using ffmpeg
    os.system(f'ffmpeg -ss {timestamp} -i notion_video.mp4 -vframes 1 -q:v 2 {output_file}')
    
    # Increment by 60 seconds
    current_time += 60

    # To use: python3 extract_frames.py