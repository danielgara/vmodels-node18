/**
 * @author Daniel Correa <dcorreab@eafit.edu.co>
 */
export class ComponentFunctions {
  public static customize(graph:any) {
    // collect the information of the components and files to be customized
    const bindingRoot = graph.getModel().getCell('binding_feature_component');
    const bindingRelations = graph.getModel().getChildEdges(bindingRoot);

    const customizations = [];

    for (let i = 0; i < bindingRelations.length; i += 1) {
      const { source } = bindingRelations[i];
      const { target } = bindingRelations[i];
      if (source.getAttribute('selected') == 'true') { // only selected concrete features are analyzed
        let label = target.getAttribute('label');
        const clonId = target.getId();
        const id = clonId.replace('clon', '');
        const incoEgdes = graph.getModel().getIncomingEdges(graph.getModel().getCell(id));
        for (let j = 0; j < incoEgdes.length; j += 1) {
          const fileSource = incoEgdes[j].source;
          if (fileSource.getAttribute('type') == 'custom') {
            label = label.replace('-', '/');
            customizations.push(label);
          }
        }
      }
    }

    return customizations;
  }

  public static verify(graph:any) {
    // collect the information of the components and files to be derived
    const bindingRoot = graph.getModel().getCell('binding_feature_component');
    const bindingRelations = graph.getModel().getChildEdges(bindingRoot);

    const destinations = [];

    for (let i = 0; i < bindingRelations.length; i += 1) {
      const { source } = bindingRelations[i];
      const { target } = bindingRelations[i];
      if (source.getAttribute('selected') == 'true') { // only selected concrete features are analyzed
        const label = target.getAttribute('label');
        const clonId = target.getId();
        const id = clonId.replace('clon', '');
        const incoEgdes = graph.getModel().getIncomingEdges(graph.getModel().getCell(id));
        for (let j = 0; j < incoEgdes.length; j += 1) {
          const fileSource = incoEgdes[j].source;
          if (fileSource.getAttribute('type') == 'file') {
            const data = { destination: '' };
            data.destination = fileSource.getAttribute('destination');
            destinations.push(data.destination);
          }
        }
      }
    }

    return destinations;
  }

  public static execute(graph:any) {
    // collect the information of the components and files to be derived
    const bindingRoot = graph.getModel().getCell('binding_feature_component');
    const bindingRelations = graph.getModel().getChildEdges(bindingRoot);
    const files = [];
    for (let i = 0; i < bindingRelations.length; i += 1) {
      let source:any;
      let target:any;
      try {
        source = bindingRelations[i].source;
        target = bindingRelations[i].target;
        if (source.getAttribute('selected') == 'true') { // only selected concrete features are analyzed
          const label = target.getAttribute('label');
          const clonId = target.getId();
          const id = clonId.replace('clon', '');
          let appDestination = "";

          const outEgdes = graph.getModel().getOutgoingEdges(graph.getModel().getCell(id));
          if (outEgdes) {
            const appTarget = outEgdes[0].target;
            appDestination = appTarget.getAttribute('destination');
          }

          const incoEgdes = graph.getModel().getIncomingEdges(graph.getModel().getCell(id));

          let bundles = [];

          for (let j = 0; j < incoEgdes.length; j += 1) {
            const fileSource = incoEgdes[j].source;
            if (fileSource.getAttribute('type') == 'bundle') {
              bundles.push(fileSource);
            }
            else if (fileSource.getAttribute('type') != 'custom') {
              const data = {
                component_folder: '', ID: '', filename: '', destination: '',
              };
              data.component_folder = label;
              data.component_folder = data.component_folder.replace("-", "/");
              data.ID = fileSource.getAttribute('label');
              data.filename = fileSource.getAttribute('filename');
              if (fileSource.getAttribute('type') == 'file') {
                data.destination = appDestination + fileSource.getAttribute('destination');
              } else {
                data.destination = '';
              }
              files.push(data);
            }
          }

          //check for bundles (components selectable)
          for (let j = 0; j < bundles.length; j += 1) {
            const incoBundleEgdes = graph.getModel().getIncomingEdges(graph.getModel().getCell(bundles[j].getId()));
            for (let k = 0; k < incoBundleEgdes.length; k += 1) {
              const sourceBundle = incoBundleEgdes[k].source;
              if (sourceBundle.getAttribute('selected') == 'true') { // only selected components selectables are analyzed
                const labelBundle = sourceBundle.getAttribute('label');
                const incoFileEgdes = graph.getModel().getIncomingEdges(graph.getModel().getCell(sourceBundle.getId()));
                for (let l = 0; l < incoFileEgdes.length; l += 1) {
                  const fileSource = incoFileEgdes[l].source;
                  if (fileSource.getAttribute('type') != 'custom') {
                    const data = {
                      component_folder: '', ID: '', filename: '', destination: '',
                    };
                    data.component_folder = labelBundle;
                    data.component_folder = data.component_folder.replaceAll("-", "/");
                    data.ID = fileSource.getAttribute('label');
                    data.filename = fileSource.getAttribute('filename');
                    if (fileSource.getAttribute('type') == 'file') {
                      data.destination = appDestination + fileSource.getAttribute('destination');
                    } else {
                      data.destination = '';
                    }
                    files.push(data);
                  }
                }
              }
            }
          }
        }
      } catch {
        // remove strange generated rels
        const cells = [];
        cells[0] = bindingRelations[i];
        graph.removeCells(cells);
      }
    }

    const completeData = [];
    completeData[0] = files;

    return completeData;
  }
}
