# For Developers

## File Provisioning Plugins

When developing new plugins, we recommend using the [s3-plugin](https://github.com/dockstore/s3-plugin) as a model for plugins where [a Java library is available](https://aws.amazon.com/sdk-for-java/).
We recommend using the [icgc-storage-client-plugin](https://github.com/dockstore/icgc-storage-client-plugin) as a model for plugins where a Java library is not available and the plugin needs to call out to an external binary.

This was developed in an environment with Java 8 and Maven 3.3.9.

The steps for implementing a new plugin are as follows:

1. Fork the one of the above repos.
2. Rename the project in the [pom.xml](https://github.com/dockstore/s3-plugin/blob/master/pom.xml#L6) by changing the artifactId, the name, and the plugin class in properties. If you wish to share your project, you may also wish to modify the repository locations.
3. Remove the dependency on the AWS S3 library and add a library for your file transfer system [here](https://github.com/dockstore/s3-plugin/blob/master/pom.xml#L200).
4. Rename the Java class to match the plugin class entered earlier in the pom.xml.
5. Implement the downloadFrom and uploadTo methods from  [ProvisionInterface](https://github.com/ga4gh/dockstore/blob/develop/dockstore-file-plugin-parent/src/main/java/io/dockstore/provision/ProvisionInterface.java) Note that if your file provisioning system is input-only or output-only, you can throw an OperationNotSupportedException or similar.
6. We recommend using [ProgressPrinter](https://github.com/ga4gh/dockstore/blob/develop/dockstore-file-plugin-parent/src/main/java/io/dockstore/provision/ProgressPrinter.java) to give your users an indication of file upload/download progress.
7. If applicable, for file transfer systems that include metadata or require preparation or finalize steps, you can override the default methods listed in the ProvisionInterface. Note that the Base64 encoded metadata will be decoded by the time it reaches your plugin. It is up to you what kind of format the metadata should be in (for example, the s3 plugin uses a JSON map).
8. Build the plugin with `mvn clean install` and copy the result zip file to the plugin directory.
9. Test with a simple tool such as [md5sum](https://github.com/briandoconnor/dockstore-tool-md5sum).

You should see something similar to the following
```
$ cat test.s3.json
{
  "input_file": {
        "class": "File",
        "path": "s3://oicr.temp/bamstats_report.zip"
    },
    "output_file": {
        "class": "File",
        "metadata": "eyJvbmUiOiJ3b24iLCJ0d28iOiJ0d28ifQ==",
        "path": "s3://oicr.temp/bamstats_report.zip"
    }
}

$ dockstore tool launch --entry  quay.io/briandoconnor/dockstore-tool-md5sum  --json test.s3.json
Creating directories for run of Dockstore launcher at: ./datastore//launcher-a246f1b6-21fd-468e-8780-b064d311dda5
Provisioning your input files to your local machine
Downloading: #input_file from s3://oicr.temp/bamstats_report.zip into directory: /media/large_volume/dockstore_tools/dockstore-tool-md5sum/./datastore/launcher-a246f1b6-21fd-468e-8780-b064d311dda5/inputs/73b70f11
-1711-40b7-bfea-9ee4543a8226
Found file s3://oicr.temp/bamstats_report.zip in cache, hard-linking
Calling on plugin io.dockstore.provision.S3Plugin$S3Provision to provision s3://oicr.temp/bamstats_report.zip
Calling out to cwltool to run your tool
Executing: cwltool --enable-dev --non-strict --outdir /media/large_volume/dockstore_tools/dockstore-tool-md5sum/./datastore/launcher-a246f1b6-21fd-468e-8780-b064d311dda5/outputs/ --tmpdir-prefix /media/large_volu
me/dockstore_tools/dockstore-tool-md5sum/./datastore/launcher-a246f1b6-21fd-468e-8780-b064d311dda5/tmp/ --tmp-outdir-prefix /media/large_volume/dockstore_tools/dockstore-tool-md5sum/./datastore/launcher-a246f1b6-
21fd-468e-8780-b064d311dda5/working/ /tmp/1488407859906-0/temp3047430238970788171.cwl /media/large_volume/dockstore_tools/dockstore-tool-md5sum/./datastore/launcher-a246f1b6-21fd-468e-8780-b064d311dda5/workflow_p
arams.json
/usr/local/bin/cwltool 1.0.20170217172322
...
```

To disable or enable plugins, create a disabled.txt file or enabled.txt file in the plugins folder.  If an enabled.txt file exists, only the plugins listed in the file will be enabled.  If a disabled.txt file exists, the plugins listed in the file will be disabled.  The disabled.txt file is ignored if the enabled.txt exists.  Here is a sample enabled.txt or disabled.txt file:

```
dockstore-file-s3-plugin
dockstore-file-synapse-plugin
```

See https://github.com/decebals/pf4j#enabledisable-plugins more details.
## Write-API Conversion Process
### Client Configuration
The configuration file used by the write-api-client is located at ~/.dockstore/write.api.config.properties
It should look something like this:

```
dockstoreToken=abcdefghijklmnopqrstuvwxyz1234567890
server-url=https://www.dockstore.org:8443
organization=test_organization
repo=test_repository
write-api-url=http://localhost:8080/api/ga4gh/v1
```

"token" is the dockstore token which is acquired from the dockstore website.
"server-url" is the dockstore server url.
"organization" is the organization/user of the repository to create.  
"repo" is the repository to create.
"write-api-url" is the url of the write-api-service

### Server Configuration
The write-api-service uses githubToken and quayToken from the server yml file and looks something like this:

```
quayioToken: abcdefghijklmnopqrstuvwxyz1234567890
githubToken: abcdefghijklmnopqrstuvwxyz1234567890
...
```
The github token can be attained by following the instructions from [GitHub Help](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
The quay.io token can be attained by following the instruction from [Quay.io API docs](https://docs.quay.io/api/) -> OAuth 2 Access Tokens -> Generating a Token (for internal application use).  When generating the token, provide these 3 permissions:
* Create Repositories
* View all visible repositories
* Read/Write to any accessible repositories

### Client Usage
```
Usage: client [options] [command] [command options]
  Options:
    --help
      Prints help for the client.
      Default: false
  Commands:
    add      Add the Dockerfile and CWL file(s) using the write API.
      Usage: add [options]
        Options:
        * --Dockerfile
            The Dockerfile to upload
        * --cwl-file
            The cwl descriptor to upload
          --cwl-secondary-file
            The optional secondary cwl descriptor to upload
          --help
            Prints help for the add command
            Default: false
          --version
            The version of the tool to upload to

    publish      Publish tool to dockstore using the output of the 'add'
            command.
      Usage: publish [options]
        Options:
          --help
            Prints help for the publish command.
            Default: false
        * --tool
            The json output from the 'add' command.
```

### Sample Client Output
```
client add --Dockerfile Dockerfile --cwl-file Dockstore.cwl --cwl-secondary-file Dockstore2.cwl --version 3.0
{
  "githubURL": "https://github.com/dockstore-testing/test_repo3",
  "quayioURL": "https://quay.io/repository/dockstore-testing/test_repo3",
  "version": "3.0"
}
```
You can pipe the output like this:
```
client add --Dockerfile Dockerfile --cwl-file Dockstore.cwl --cwl-secondary-file Dockstore2.cwl --version 3.0 > test.json
```
and then:
```
client publish --tool test.json
```
