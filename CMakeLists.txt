cmake_minimum_required(VERSION 3.15)
project(KerrBlackHole LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find OpenGL
find_package(OpenGL REQUIRED)

# GLFW
find_package(glfw3 CONFIG REQUIRED)

# Add GLAD
add_library(glad STATIC external/glad/src/glad.c)
target_include_directories(glad PUBLIC external/glad/include)

# ImGui
file(GLOB IMGUI_SOURCES 
    external/imgui/*.cpp
    external/imgui/backends/imgui_impl_glfw.cpp
    external/imgui/backends/imgui_impl_opengl3.cpp
)
add_library(imgui STATIC ${IMGUI_SOURCES})
target_include_directories(imgui PUBLIC external/imgui external/imgui/backends)
target_link_libraries(imgui glfw OpenGL::GL)

# Main executable
add_executable(KerrBlackHole main.cpp)
target_link_libraries(KerrBlackHole PRIVATE glad imgui glfw OpenGL::GL)
target_include_directories(KerrBlackHole PRIVATE external/glad/include external/imgui)

# Copy shaders to build directory
configure_file(${CMAKE_SOURCE_DIR}/shaders/blackhole.vert ${CMAKE_BINARY_DIR}/shaders/blackhole.vert COPYONLY)
configure_file(${CMAKE_SOURCE_DIR}/shaders/blackhole.frag ${CMAKE_BINARY_DIR}/shaders/blackhole.frag COPYONLY)
