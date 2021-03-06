# Launching Tools and Workflows

This tutorial walks through some of our utilities for quickly launching tools and workflows in a naive way.

## Dockstore CLI

The dockstore command-line includes basic tool and workflow launching capability built on top of [cwltool](https://github.com/common-workflow-language/cwltool). The Dockstore command-line also includes support for file provisioning via [plugins](https://github.com/ga4gh/dockstore/tree/develop/dockstore-file-plugin-parent) which allow for the reading of input files and the upload of output files from remote file systems. Support for http and https is built-in. Support for AWS S3 and [icgc-storage client](onboarding) is provided via plugins installed by default.  
 
### Launch Tools

If you have followed the tutorial, you will have a tool registered on Dockstore. You may want to test it out for your own work. For now you can use the Dockstore command-line interface (CLI) to run several useful commands:

0. create an empty "stub" JSON config file for entries in the Dockstore `dockstore tool convert`
0. launch a tool locally `dockstore tool launch`
  0. automatically copy inputs from remote URLs if HTTP, FTP, S3 or other remote URLs are specified
  0. call the `cwltool` command line to execute your tool using the CWL from the Dockstore and the JSON for inputs/outputs
  0. if outputs are specified as remote URLs, copy the results to these locations
0. download tool descriptor files `dockstore tool cwl` and `dockstore tool wdl`

Note that launching a CWL tool locally requires the cwltool to be installed. Check [onboarding](onboarding) if you have not already to ensure that your dependencies are correct.

An example of launching a tool, in this case a bamstats sample tool follows:

    # make a runtime JSON template and fill in desired inputs, outputs, and other parameters
    $ dockstore tool convert entry2json --entry quay.io/collaboratory/dockstore-tool-bamstats:1.25-6_1.0 > Dockstore.json
    $ vim Dockstore.json
    # note that the empty JSON config file has been filled with an input file retrieved via http
    $ cat Dockstore.json
    {
      "mem_gb": 4,
      "bam_input": {
        "path": "https://github.com/CancerCollaboratory/dockstore-tool-bamstats/raw/develop/rna.SRR948778.bam",
        "format": "http://edamontology.org/format_2572",
        "class": "File"
      },
      "bamstats_report": {
        "path": "/tmp/bamstats_report.zip",
        "class": "File"
      }
    }
    # run it locally with the Dockstore CLI
    $ dockstore tool launch --entry quay.io/collaboratory/dockstore-tool-bamstats:1.25-6_1.0 --json Dockstore.json

This information is also provided in the "Launch With" section of every tool. 

### Launch Workflows

A parallel set of commands is available for workflows. `convert`, `wdl`, `cwl`, and `launch` are all available under the `dockstore workflow` mode.

## cwltool

If you are working with cwltool directly, you can still launch tools without using the Dockstore CLI as long as 
your input files are available locally. The equivalent of the previous example would be:

    $ wget https://github.com/CancerCollaboratory/dockstore-tool-bamstats/raw/develop/rna.SRR948778.bam
    # make a runtime JSON template and fill in desired inputs, outputs, and other parameters
    $ dockstore tool convert entry2json --entry quay.io/collaboratory/dockstore-tool-bamstats:1.25-6_1.0 > Dockstore.json
    $ vim Dockstore.json
    # note that the empty JSON config file has been filled with a local input file 
    $ cat Dockstore.json
    {
      "mem_gb": 4,
      "bam_input": {
        "path": "rna.SRR948778.bam",
        "format": "http://edamontology.org/format_2572",
        "class": "File"
      },
      "bamstats_report": {
        "path": "/tmp/bamstats_report.zip",
        "class": "File"
      }
    }
    # run it locally with cwltool
    $ cwltool --non-strict https://www.dockstore.org:8443/api/ga4gh/v1/tools/quay.io%2Fcollaboratory%2Fdockstore-tool-bamstats/versions/1.25-6_1.0/plain-CWL/descriptor Dockstore.json

A similar invocation can be attempted in other CWL-compatible systems. 

## Consonance 

Consonance pre-dates Dockstore and was the framework used to run much of the data analysis for the [PCAWG](https://dcc.icgc.org/pcawg#!%2Fmutations) project by running [Seqware](https://seqware.github.io/) workflows. Documentation for this incarnation of Dockstore can be found at [Working with PanCancer Data on AWS](http://icgc.org/working-pancancer-data-aws) and [ICGC on AWS](https://aws.amazon.com/public-datasets/icgc/).

Consonance has subsequently been updated to run Dockstore tools and has also been adopted at the [UCSC Genomics Institute](https://github.com/BD2KGenomics/dcc-ops) for this purpose. Also using cwltool under-the-hood to provide CWL compatibility, Consonance provides DIY open-source support for provisioning AWS VMs and starting CWL tasks. We recommend having some knowledge of AWS EC2 before attempting this route. 

Consonance's strategy is to provision either on-demand VMs or spot priced VMs depending on cost and delegates runs of CWL tools to these provisioned VMs with one tool executing per VM. A Java-based web service and RabbitMQ provide for communication between workers and the launcher while an Ansible playbook is used to setup workers for execution.
 
### Usage
 
1. Look at the [Consonance](https://github.com/Consonance/consonance) repo and in particular, the [Docker compose based](https://github.com/Consonance/consonance/tree/develop/container-admin) setup instructions to setup the environment
2. Once logged into the client
```
consonance run --tool-dockstore-id quay.io/collaboratory/dockstore-tool-bamstats:1.25-6_1.0 --run-descriptor Dockstore.json --flavour <AWS instance-type>
```


## Next Steps

While launching tools and workflows locally is useful for testing, this approach is not useful for processing a large amount of data in a production environment. The next step is to take our Docker images, described by CWL/WDL and run them in an environment that supports those descriptors. For now, we can suggest taking a look at the environments that currently support and are validated with CWL at [https://ci.commonwl.org/](https://ci.commonwl.org/) and for WDL, [Cromwell](https://github.com/broadinstitute/cromwell).

For developers, you may also wish to look at general commercial solutions such as [Google dsub](https://github.com/googlegenomics/task-submission-tools) and [AWS Batch](https://aws.amazon.com/batch/). 
