module ane.fs;

import std.string;

public import std.file : thisExePath;
public import std.file : readText, dirEntries, SpanMode;

string getExecutionPath()
{
    string p = thisExePath();
    return p[0 .. p.lastIndexOf("/") + 1];
}
