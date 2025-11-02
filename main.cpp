#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <imgui.h>
#include <imgui_impl_glfw.h>
#include <imgui_impl_opengl3.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cmath>

// Window dimensions
const int WINDOW_WIDTH = 1280;
const int WINDOW_HEIGHT = 720;

// Camera state
struct Camera {
    float inclination = 70.0f; // degrees
    float azimuth = 0.0f;
    float distance = 15.0f;
    bool isDragging = false;
    double lastMouseX = 0.0;
    double lastMouseY = 0.0;
};

// Black hole parameters
struct BlackHoleParams {
    float spin = 0.998f;           // Kerr parameter a
    float inclination = 70.0f;     // viewing angle (degrees)
    float cameraDist = 15.0f;      // camera distance from BH
    float diskColorTemp = 6000.0f; // K
    float exposure = 1.5f;
    bool showStars = true;
    bool animateSpin = false;
    float time = 0.0f;
};

Camera gCamera;
BlackHoleParams gParams;

// Shader utility functions
std::string readFile(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "Failed to open file: " << path << std::endl;
        return "";
    }
    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

GLuint compileShader(GLenum type, const std::string& source) {
    GLuint shader = glCreateShader(type);
    const char* src = source.c_str();
    glShaderSource(shader, 1, &src, nullptr);
    glCompileShader(shader);
    
    GLint success;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        char infoLog[512];
        glGetShaderInfoLog(shader, 512, nullptr, infoLog);
        std::cerr << "Shader compilation error:\n" << infoLog << std::endl;
    }
    return shader;
}

GLuint createShaderProgram(const std::string& vertPath, const std::string& fragPath) {
    std::string vertSource = readFile(vertPath);
    std::string fragSource = readFile(fragPath);
    
    GLuint vertShader = compileShader(GL_VERTEX_SHADER, vertSource);
    GLuint fragShader = compileShader(GL_FRAGMENT_SHADER, fragSource);
    
    GLuint program = glCreateProgram();
    glAttachShader(program, vertShader);
    glAttachShader(program, fragShader);
    glLinkProgram(program);
    
    GLint success;
    glGetProgramiv(program, GL_LINK_STATUS, &success);
    if (!success) {
        char infoLog[512];
        glGetProgramInfoLog(program, 512, nullptr, infoLog);
        std::cerr << "Shader linking error:\n" << infoLog << std::endl;
    }
    
    glDeleteShader(vertShader);
    glDeleteShader(fragShader);
    
    return program;
}

// GLFW callbacks
void framebufferSizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

void mouseButtonCallback(GLFWwindow* window, int button, int action, int mods) {
    if (button == GLFW_MOUSE_BUTTON_LEFT) {
        if (action == GLFW_PRESS) {
            gCamera.isDragging = true;
            glfwGetCursorPos(window, &gCamera.lastMouseX, &gCamera.lastMouseY);
        } else if (action == GLFW_RELEASE) {
            gCamera.isDragging = false;
        }
    }
}

void cursorPosCallback(GLFWwindow* window, double xpos, double ypos) {
    if (gCamera.isDragging) {
        double dx = xpos - gCamera.lastMouseX;
        double dy = ypos - gCamera.lastMouseY;
        
        gParams.inclination += static_cast<float>(dy) * 0.2f;
        gParams.inclination = std::max(0.0f, std::min(180.0f, gParams.inclination));
        
        gCamera.lastMouseX = xpos;
        gCamera.lastMouseY = ypos;
    }
}

void scrollCallback(GLFWwindow* window, double xoffset, double yoffset) {
    gParams.cameraDist -= static_cast<float>(yoffset) * 0.5f;
    gParams.cameraDist = std::max(2.5f, std::min(50.0f, gParams.cameraDist));
}

void keyCallback(GLFWwindow* window, int key, int scancode, int action, int mods) {
    if (action == GLFW_PRESS || action == GLFW_REPEAT) {
        const float step = 0.5f;
        if (key == GLFW_KEY_W) gParams.cameraDist = std::max(2.5f, gParams.cameraDist - step);
        if (key == GLFW_KEY_S) gParams.cameraDist = std::min(50.0f, gParams.cameraDist + step);
        if (key == GLFW_KEY_ESCAPE) glfwSetWindowShouldClose(window, GLFW_TRUE);
    }
}

int main() {
    // Initialize GLFW
    if (!glfwInit()) {
        std::cerr << "Failed to initialize GLFW" << std::endl;
        return -1;
    }
    
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    
    GLFWwindow* window = glfwCreateWindow(WINDOW_WIDTH, WINDOW_HEIGHT, 
                                          "Kerr Black Hole - Gravitational Lensing", 
                                          nullptr, nullptr);
    if (!window) {
        std::cerr << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    
    glfwMakeContextCurrent(window);
    glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);
    glfwSetMouseButtonCallback(window, mouseButtonCallback);
    glfwSetCursorPosCallback(window, cursorPosCallback);
    glfwSetScrollCallback(window, scrollCallback);
    glfwSetKeyCallback(window, keyCallback);
    glfwSwapInterval(1); // VSync
    
    // Initialize GLAD
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cerr << "Failed to initialize GLAD" << std::endl;
        return -1;
    }
    
    // Setup ImGui
    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO();
    ImGui::StyleColorsDark();
    ImGui_ImplGlfw_InitForOpenGL(window, true);
    ImGui_ImplOpenGL3_Init("#version 460");
    
    // Create shader program
    GLuint shaderProgram = createShaderProgram("shaders/blackhole.vert", 
                                               "shaders/blackhole.frag");
    
    // Full-screen quad
    float quadVertices[] = {
        -1.0f,  1.0f,  0.0f, 1.0f,
        -1.0f, -1.0f,  0.0f, 0.0f,
         1.0f, -1.0f,  1.0f, 0.0f,
        -1.0f,  1.0f,  0.0f, 1.0f,
         1.0f, -1.0f,  1.0f, 0.0f,
         1.0f,  1.0f,  1.0f, 1.0f
    };
    
    GLuint VAO, VBO;
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    
    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(quadVertices), quadVertices, GL_STATIC_DRAW);
    
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));
    glEnableVertexAttribArray(1);
    
    glBindVertexArray(0);
    
    // Get uniform locations
    GLint locResolution = glGetUniformLocation(shaderProgram, "uResolution");
    GLint locSpin = glGetUniformLocation(shaderProgram, "uSpin");
    GLint locInclination = glGetUniformLocation(shaderProgram, "uInclination");
    GLint locCameraDist = glGetUniformLocation(shaderProgram, "uCameraDist");
    GLint locExposure = glGetUniformLocation(shaderProgram, "uExposure");
    GLint locShowStars = glGetUniformLocation(shaderProgram, "uShowStars");
    GLint locTime = glGetUniformLocation(shaderProgram, "uTime");
    GLint locDiskTemp = glGetUniformLocation(shaderProgram, "uDiskColorTemp");
    
    std::cout << "\n=== Kerr Black Hole Renderer ===" << std::endl;
    std::cout << "Controls:" << std::endl;
    std::cout << "  Left Mouse: Drag to change viewing angle" << std::endl;
    std::cout << "  Scroll:     Zoom in/out" << std::endl;
    std::cout << "  W/S:        Move camera closer/farther" << std::endl;
    std::cout << "  ESC:        Exit" << std::endl;
    std::cout << "================================\n" << std::endl;
    
    // Main render loop
    while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();
        
        // Update animation
        if (gParams.animateSpin) {
            gParams.time += 0.016f;
        }
        
        // Start ImGui frame
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplGlfw_NewFrame();
        ImGui::NewFrame();
        
        // ImGui Control Panel
        {
            ImGui::SetNextWindowPos(ImVec2(10, 10), ImGuiCond_FirstUseEver);
            ImGui::SetNextWindowSize(ImVec2(350, 400), ImGuiCond_FirstUseEver);
            ImGui::Begin("Black Hole Parameters");
            
            ImGui::Text("Kerr Black Hole Renderer");
            ImGui::Separator();
            
            ImGui::SliderFloat("Spin (a)", &gParams.spin, 0.0f, 0.998f, "%.3f");
            ImGui::SliderFloat("Inclination (deg)", &gParams.inclination, 0.0f, 180.0f, "%.1f");
            ImGui::SliderFloat("Camera Distance", &gParams.cameraDist, 2.5f, 50.0f, "%.1f");
            ImGui::SliderFloat("Exposure", &gParams.exposure, 0.1f, 5.0f, "%.2f");
            ImGui::SliderFloat("Disk Temperature (K)", &gParams.diskColorTemp, 3000.0f, 15000.0f, "%.0f");
            
            ImGui::Separator();
            ImGui::Checkbox("Show Stars", &gParams.showStars);
            ImGui::Checkbox("Animate Spin", &gParams.animateSpin);
            
            ImGui::Separator();
            if (ImGui::Button("Reset to Schwarzschild (a=0)")) {
                gParams.spin = 0.0f;
            }
            if (ImGui::Button("Maximize Spin (a=0.998)")) {
                gParams.spin = 0.998f;
            }
            if (ImGui::Button("Interstellar View (i=70°)")) {
                gParams.inclination = 70.0f;
            }
            
            ImGui::Separator();
            ImGui::Text("%.1f FPS (%.3f ms)", io.Framerate, 1000.0f / io.Framerate);
            
            ImGui::End();
        }
        
        // Render
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        
        glUseProgram(shaderProgram);
        
        int width, height;
        glfwGetFramebufferSize(window, &width, &height);
        glUniform2f(locResolution, static_cast<float>(width), static_cast<float>(height));
        glUniform1f(locSpin, gParams.spin);
        glUniform1f(locInclination, gParams.inclination * 3.14159265359f / 180.0f);
        glUniform1f(locCameraDist, gParams.cameraDist);
        glUniform1f(locExposure, gParams.exposure);
        glUniform1i(locShowStars, gParams.showStars ? 1 : 0);
        glUniform1f(locTime, gParams.time);
        glUniform1f(locDiskTemp, gParams.diskColorTemp);
        
        glBindVertexArray(VAO);
        glDrawArrays(GL_TRIANGLES, 0, 6);
        
        // Render ImGui
        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
        
        glfwSwapBuffers(window);
    }
    
    // Cleanup
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteProgram(shaderProgram);
    
    ImGui_ImplOpenGL3_Shutdown();
    ImGui_ImplGlfw_Shutdown();
    ImGui::DestroyContext();
    
    glfwDestroyWindow(window);
    glfwTerminate();
    
    return 0;
}
