/*precision mediump float;*/

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
varying vec2 fragTexCoord;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
 fragTexCoord = vertTexCoord;
 gl_Position = projection * view * model * vec4(vertPosition,  1.0);
}


