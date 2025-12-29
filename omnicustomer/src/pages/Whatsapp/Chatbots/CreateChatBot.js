import React, { useEffect, useRef, useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import { useNavigate } from 'react-router-dom';
import 'drawflow/dist/drawflow.min.css'; // Import Drawflow CSS
import Drawflow from 'drawflow'; // assuming you installed and imported Drawflow
import './ChatBot.css'
import { Modal } from 'react-bootstrap';
import { getBase64, triggerAlert } from '../../../utils/CommonFunctions';
import { createWAChatbot } from '../../../utils/ApiClient';

export default function CreateChatBot() {
    const heading = "Create WA Chatbot";
    const navigate = useNavigate();
    const drawflowRef = useRef(null);
    const editorRef = useRef(null);
    const textareaRef = useRef(null); // Reference to the textarea
    const nodeConnectionsRef = useRef(null); // Ref to manage node connections DOM
    const mobileItemSelected = useRef('');
    const mobileLastMove = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [nodeIdCounter, setNodeIdCounter] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const [messageType, setMessageType] = useState("text");
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [headerText, setHeaderText] = useState("");
    const [headerFile, setHeaderFile] = useState(null);
    const [chatbotName, setChatbotName] = useState("");
    ////////////////handle functions ///////////////////
    const handleBackButton = () => {
        navigate('/whatsapp/chatbot/chatbot');
    }

    const handleModalShow = () => {
        setShowModal(true);
    }
    const handleModalClose = () => {
        setShowModal(false);
    }

    const handleHeaderFile = async (e) => {
        const file = e.target.files[0];
        let items = {};

        if (!file) {
            items.error = "File is required."
            return;
        }

        // Check if the file is a PDF
        // if (file.type === "application/pdf") {
        //     items.error = "PDF files are not allowed.";
        //     e.target.value = ''; // Clear the input
        //     setMMSFile(items); // Set error state
        //     return;
        // }

        // Check if the file size exceeds 2MB
        if (file.size > 2 * 1024 * 1024) {
            items.error = "File size should not exceed 2MB.";
            e.target.value = ''; // Clear the input
            setHeaderFile(items); // Set error state
            return;
        }

        try {
            // Convert file to base64
            const base64 = await getBase64(file);
            const base64WithoutPrefix = base64.substring(base64.indexOf(",") + 1);
            items = {
                ...items,
                file_name: file?.name,
                file_type: file?.name?.split(".")[1],
                file_size: file.size,
                file: base64WithoutPrefix,
                preview: base64 // Store the full base64 string for preview
            };
            setHeaderFile(items);
        } catch (error) {
            // console.error("Error converting file to base64:", error);
            items.error = "Failed to process the file.";
            setHeaderFile(items);
        }
    }
    ///////////////// chat draw flow code //////////////////

    useEffect(() => {
        // var id = document.getElementById("drawflow");
        const editor = new Drawflow(drawflowRef.current);
        //console.log("editor", editor)
        // const editor = new Drawflow(id);

        editorRef.current = editor;

        editor.reroute = true;
        // Optionally, you can import initial data here
        const dataToImport = {
            "drawflow":
            {
                "Home":
                {
                    "data":
                    {
                        "1":
                        {
                            "id": 1,
                            "name": "welcome_message",
                            "data": {
                                "parentNodeId": "node_1"
                            },
                            "class": "welcome_message",
                            "html": `
                          <div class="card">
                            <div class="card-header">Type A Message</div>
                            <div class="card-body">
                              <p>Welcome message</p>
                              <textarea class="form-control" name="welcome_message_node[node_1]" placeholder="Enter welcome message" id="welcome_message_node" readonly></textarea>
                              <br/>
                              <p>Text fields</p>
                              <textarea class="form-control" name="text_field_node[node_1]" id="text_field_node" placeholder="Enter data as comma separated"></textarea>
                              <div id="validationError_node_1" style="color: red; display: none;">Invalid text format. Please enter the values as comma separated.</div>
                              <br/>
                              <div>
                                <p>Select type</p>
                                <select class="form-select" name="type_array[node_1]" id="type_array">
                                  <option value="list">List</option>
                                  <option value="radio">Buttons</option>
                                </select>
                              </div>
                              <input type="hidden" name="pos_x[node_1]" value="50">
                              <input type="hidden" name="pos_y[node_1]" value="50">
                              <input type="hidden" name="input_type[node_1]" value="initial_node">
                            </div>
                          </div>`,
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": []
                                }
                            },
                            "pos_x": 50,
                            "pos_y": 50
                        },
                    }
                },
            }
        };
        // editor.drawflow(dataToImport);
        editor.start();
        editor.import(dataToImport);

        // Event Listeners
        editor.on('nodeCreated', (id) => {
            //console.log(`Node created ${id}`);
        });

        editor.on('nodeRemoved', (id) => {
            //console.log(`Node removed ${id}`);
        });

        editor.on('nodeSelected', (id) => {
            //console.log(`Node selected ${id}`);
        });

        editor.on('moduleCreated', (name) => {
            //console.log(`Module Created ${name}`);
        });

        editor.on('moduleChanged', (name) => {
            //console.log(`Module Changed ${name}`);
        });

        editor.on('connectionCreated', (connection) => {
            //console.log('Connection created');

            var output_id_value = connection.output_id; // ID of the source/output node
            var input_id_value = connection.input_id;  // ID of the target/input node
            var input_class_value = connection.input_class;  // ID of the target/input node
            var output_class_value = connection.output_class;  // ID of the target/input node

            var sourceNode = editor.getNodeFromId(output_id_value);
            var targetNode = editor.getNodeFromId(input_id_value);

            //console.log(output_id_value);
            //console.log(input_id_value);
            // Access the custom data attached to the nodes
            var sourceParentNodeId = sourceNode.data.parentNodeId;
            var targetParentNodeId = targetNode.data.parentNodeId;
            //console.log("sourceParentNodeId " + sourceParentNodeId);
            //console.log("targetParentNodeId " + targetParentNodeId);
            /////////////////////////////////////////////////////

            var output_node = document.createElement('input');
            output_node.type = 'hidden';
            output_node.name = 'output_node[' + targetParentNodeId + '][]';
            output_node.className = 'output_node' + targetParentNodeId + output_id_value + input_id_value;
            output_node.value = sourceParentNodeId;


            var output_id = document.createElement('input');
            output_id.type = 'hidden';
            output_id.name = 'output_id[' + targetParentNodeId + '][]';
            output_id.className = 'output_id' + targetParentNodeId + output_id_value + input_id_value;
            output_id.value = output_id_value;


            var input_id = document.createElement('input');
            input_id.type = 'hidden';
            input_id.name = 'input_id[' + targetParentNodeId + '][]';
            input_id.className = 'input_id' + targetParentNodeId + output_id_value + input_id_value;
            input_id.value = input_id_value;

            var input_class = document.createElement('input');
            input_class.type = 'hidden';
            input_class.name = 'input_class[' + targetParentNodeId + '][]';
            input_class.className = 'input_class' + targetParentNodeId + output_id_value + input_id_value;
            input_class.value = input_class_value;

            var output_class = document.createElement('input');
            output_class.type = 'hidden';
            output_class.name = 'output_class[' + targetParentNodeId + '][]';
            output_class.className = 'output_class' + targetParentNodeId + output_id_value + input_id_value;
            output_class.value = output_class_value;


            // Append the inputs to a suitable container in your HTML (e.g., a <div>)
            // You can modify this based on your HTML structure
            document.getElementById('node-connections').appendChild(output_id);
            document.getElementById('node-connections').appendChild(input_id);
            document.getElementById('node-connections').appendChild(output_class);
            document.getElementById('node-connections').appendChild(input_class);
            document.getElementById('node-connections').appendChild(output_node);
        });

        editor.on('connectionRemoved', (connection) => {
            //console.log('Connection removed');
            //console.log('Connection removed');
            //console.log(connection);
            var output_id = connection.output_id;
            var input_id = connection.input_id;


            //console.log(output_id);
            //console.log(input_id);

            var conn_removed = document.createElement('input');
            conn_removed.type = 'hidden';
            conn_removed.name = 'conn_removed[' + output_id + ']';
            conn_removed.value = input_id;

            document.getElementById('node-connections').appendChild(conn_removed);

            var sourceNode = editor.getNodeFromId(output_id);
            var targetNode = editor.getNodeFromId(input_id);

            var sourceParentNodeId = sourceNode.data.parentNodeId;
            var targetParentNodeId = targetNode.data.parentNodeId;

            var class_name = ".output_node" + targetParentNodeId + output_id + input_id;
            removeConnectionData(class_name);
            var class_name = ".output_id" + targetParentNodeId + output_id + input_id;
            removeConnectionData(class_name);
            var class_name = ".input_id" + targetParentNodeId + output_id + input_id;
            removeConnectionData(class_name);
            var class_name = ".input_class" + targetParentNodeId + output_id + input_id;
            removeConnectionData(class_name);
            var class_name = ".output_class" + targetParentNodeId + output_id + input_id;
            removeConnectionData(class_name);

        });

        editor.on('mouseMove', (position) => {
            // console.log(`Position mouse x: ${position.x} y: ${position.y}`);
        });

        editor.on('nodeMoved', (id) => {
            //console.log('Node moved', id);
            // var node_object = editor.getNodeFromId(id);

            // var node = node_object.data.parentNodeId;
            // var pos_x = node_object.pos_x;
            // var pos_y = node_object.pos_y;

            // updateNodePositions(node, pos_x, pos_y);
            const nodeObject = editor.getNodeFromId(id);
            const node = nodeObject.data.parentNodeId;
            const pos_x = nodeObject.pos_x;
            const pos_y = nodeObject.pos_y;

            // Save node positions in state or backend
            updateNodePositions(node, pos_x, pos_y);
        });

        editor.on('zoom', (zoom) => {
            //console.log(`Zoom level ${zoom}`);
        });

        editor.on('translate', (position) => {
            //console.log(`Translate x: ${position.x} y: ${position.y}`);
        });

        editor.on('addReroute', (id) => {
            //console.log(`Reroute added ${id}`);
        });

        editor.on('removeReroute', (id) => {
            //console.log(`Reroute removed ${id}`);
        });

        // Drag and drop event listeners for touch actions
        const elements = document.getElementsByClassName('drag-drawflow');
        Array.from(elements).forEach((element) => {
            element.addEventListener('touchend', handleDrop, false);
            element.addEventListener('touchmove', positionMobile, false);
            element.addEventListener('touchstart', handleDrag, false);
        });

        // trigger modal on click of welcome message 
        const welcomeMessageTextarea = document.getElementById('welcome_message_node');
        if (welcomeMessageTextarea) {
            welcomeMessageTextarea.addEventListener('click', handleModalShow);
        }

        // Cleanup the event listener
        return () => {
            if (welcomeMessageTextarea) {
                welcomeMessageTextarea.removeEventListener('click', handleModalShow);
            }
        };
    }, []);

    function removeConnectionData(class_name) {
        var elementsToRemove = document?.querySelectorAll(class_name);

        // Loop through the selected elements and remove them
        for (var i = 0; i < elementsToRemove.length; i++) {
            var element = elementsToRemove[i];
            element.parentNode.removeChild(element);
        }
    }
    function updateNodePositions(node, pos_x, pos_y) {

        var pos_x_input = document.createElement('input');
        pos_x_input.type = 'hidden';
        pos_x_input.name = 'pos_x[' + node + ']';
        pos_x_input.value = pos_x;

        var pos_y_input = document.createElement('input');
        pos_y_input.type = 'hidden';
        pos_y_input.name = 'pos_y[' + node + ']';
        pos_y_input.value = pos_y;

        // Find the elements by ID and update the HTML
        var posXContainer = document.getElementById('node-x-positions_' + node);
        var posYContainer = document.getElementById('node-y-positions_' + node);

        if (posXContainer) {
            posXContainer.innerHTML = '';
            posXContainer.appendChild(pos_x_input);
        }

        if (posYContainer) {
            posYContainer.innerHTML = '';
            posYContainer.appendChild(pos_y_input);
        }
    }

    const handleDrag = (ev) => {

        if (ev.type === 'touchstart') {
            // For touch-based devices (e.g., smartphones or tablets)
            mobileItemSelected.current = ev.target.closest('.drag-drawflow').getAttribute('data-node');
        } else {
            // For desktop environments (using mouse drag)
            ev.dataTransfer.setData('node', ev.target.getAttribute('data-node'));

        }
        //console.log("node is setting or not :", ev.dataTransfer.getData('node'))
    };

    const handleDrop = (ev) => {
        ev.preventDefault();
        if (ev.type === 'touchend') {
            const parentDrawflow = document.elementFromPoint(
                mobileLastMove.current.touches[0].clientX,
                mobileLastMove.current.touches[0].clientY
            ).closest('#drawflow');
            if (parentDrawflow != null) {
                addNodeToDrawFlow(mobileItemSelected.current, mobileLastMove.current.touches[0].clientX, mobileLastMove.current.touches[0].clientY);
            }
            mobileItemSelected.current = '';
        } else {
            const data = ev.dataTransfer.getData('node');
            addNodeToDrawFlow(data, ev.clientX, ev.clientY);
        }
    };


    const addNodeToDrawFlow = (name, pos_x, pos_y) => {
        let htmlContent;
        const nodeId = 'node_' + nodeIdCounter;
        const editor = editorRef.current;
        if (editor.editor_mode === 'fixed') return;

        pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) -
            (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
        pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) -
            (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));

        switch (name) {
            case 'text_fields':
                htmlContent = `
                    <div class="card">
                        <div class="card-header">Type A Message</div>
                        <div class="card-body">
                            <textarea class="form-control" name="text_input_node[${nodeId}]" id="${nodeId}" onkeyup="textFieldsValidation(this.value,this.id)"></textarea>
                            <div id="validationError_${nodeId}" style="color: red; display: none;">Invalid text format. Please enter the values as comma separated.</div>
                              <div id="node-x-positions_${nodeId}" >
                            <input type="hidden" name="pos_x[${nodeId}]" value="${pos_x}">
                            </div>
                             <div id="node-y-positions_${nodeId}" >
                            <input type="hidden" name="pos_y[${nodeId}]" value="${pos_y}">
                             </div>
                            <input type="hidden" name="input_type[${nodeId}]" value="input_output">
                        </div>
                    </div>`;
                editor.addNode('text_fields', 1, 1, pos_x, pos_y, 'text_fields', { parentNodeId: nodeId }, htmlContent);
                break;
            case 'options':
                htmlContent = `
                <div class="card">
                    <div class="card-header">Type A Message</div>
                    <div class="card-body">
                    <p>Select type</p>
                        <select class="form-select" name="type_array[${nodeId}]"} >
                            <option value="list">List</option>
                            <option value="radio">Buttons</option>
                            <option value="text">Question</option>
                        </select>
                        <textarea class="form-control mt-3" name="text_input_node[${nodeId}]" }></textarea>
                        <div id="node-x-positions_${nodeId}" >
                        <input type="hidden" name="pos_x[${nodeId}]" value="${pos_x}" }>
                        </div>
                          <div id="node-y-positions_${nodeId}" >
                        <input type="hidden" name="pos_y[${nodeId}]" value="${pos_y}" }>
                        </div>
                        <input type="hidden" name="input_type[${nodeId}]" value="options" }>
                    </div>
                </div>`;;
                editor.addNode('options', 1, 1, pos_x, pos_y, 'options', { parentNodeId: nodeId }, htmlContent);
                break;
            default:
                break;
        }
        setNodeIdCounter(prev => prev + 1);
    };


    const allowDrop = (ev) => {
        ev.preventDefault();
    };

    const positionMobile = (ev) => {
        mobileLastMove.current = ev;
    };
    // Clear functionality
    const handleClear = () => {
        if (editorRef.current) {
            editorRef.current.clearModuleSelected();
        }
    };
    // Zoom in functionality
    const handleZoomIn = () => {
        if (editorRef.current) {
            editorRef.current.zoom_in();
        }
    };

    // Zoom out functionality
    const handleZoomOut = () => {
        if (editorRef.current) {
            editorRef.current.zoom_out();
        }
    };

    // Zoom reset functionality
    const handleZoomReset = () => {
        if (editorRef.current) {
            editorRef.current.zoom_reset();
        }
    };

    // Function to validate text length based on the type (list, radio, text)
    // and to check if welcome_message_node is empty
    // const validateTextInput = (temporaryData) => {
    //     const typeArray = temporaryData['type_array'] || {};
    //     const textInputNode = temporaryData['text_input_node'] || {};
    //     const welcomeMessageNode = temporaryData['welcome_message_node'] || {};
    //     const textFieldNodeValue = temporaryData['text_field_node'];
    //     const inputId = temporaryData['input_id'] || {};
    //     const outputId = temporaryData['output_id'] || {};
    //     // Validate welcome_message_node
    //     if (!welcomeMessageNode || Object.keys(welcomeMessageNode).length === 0 || Object.values(welcomeMessageNode).some(val => val?.trim() === "")) {
    //         alert("The welcome message cannot be empty.");
    //         return false; // Validation failed
    //     }
    //     // Validate text_field_node is not empty
    //     if (!textFieldNodeValue || Object.keys(textFieldNodeValue).length === 0 || Object.values(textFieldNodeValue).some(val => val?.trim() === "")) {
    //         alert("The text field cannot be empty.");
    //         return false; // Validation failed
    //     }
    //     // Check if parent node (node_1) has at least one connection
    //     // New validation: Check if at least one node has output_id as 1
    //     const hasParentNode = Object.values(outputId).some(value => {
    //         // Check if the value is either a number or an array containing 1
    //         if (Array.isArray(value)) {
    //             return value.includes(1);
    //         }
    //         return value === 1;
    //     });

    //     if (!hasParentNode) {
    //         alert("Parent needs to be connected. At least one node should have an output_id of 1.");
    //         return false; // Validation failed
    //     }
    //     // Validate text input length based on type (list, radio, text)
    //     let valid = true;

    //     // Incoming node cannot be more than 1
    //     Object.keys(inputId).forEach(nodeId => {
    //         if (inputId[nodeId].length > 1) {
    //             alert(`Only one incoming options is accepted.`);
    //             valid = false;
    //         }
    //     });

    //     Object.keys(typeArray).forEach(nodeId => {
    //         const type = typeArray[nodeId]; // Get the type (list, radio, or text) for this node
    //         const textValue = textInputNode[nodeId]; // Get the corresponding text input value for this node
    //         let connectionCount = {};

    //         // Check if the type is 'list' or 'radio' and the value exceeds 20 characters
    //         if ((type === 'list' || type === 'radio') && textValue && textValue.length > 20) {
    //             alert(`The text input for node ${nodeId} with type "${type}" exceeds the 20 characters limit.`);
    //             valid = false;
    //         }
    //         // Check if the type is 'text' and the value exceeds 4095 characters
    //         else if (type === 'text' && textValue && textValue.length > 4095) {
    //             alert(`The text input for node ${nodeId} with type "text" exceeds the 4095 characters limit.`);
    //             valid = false;
    //         }
    //         // Validate: If type is 'list', ensure the node has no more than 10 connections
    //         if (typeArray[nodeId] === 'list') {
    //             connectionCount[nodeId] = 0; // Initialize the count for this node

    //             // Count how many times this nodeId appears in outputId
    //             Object.values(outputId).forEach(outputValue => {
    //                 if (outputValue === parseInt(nodeId)) {
    //                     connectionCount[nodeId] += 1;
    //                 }
    //             });

    //             // Validate if the number of connections exceeds 10
    //             if (connectionCount[nodeId] > 10) {
    //                 alert(`Node ${nodeId} of type 'list' has more than 10 connections.`);
    //                 return false; // Validation failed
    //             }
    //         }
    //     });

    //     return valid; // Return true if all validations passed
    // };
    const validatePayload = (payload) => {
        const welcomeMessageNode = payload['welcome_message_node'] || {};
        const textFieldNodeValue = payload['text_field_node'] || {};
        const outputId = payload['output_id'] || {};
        const typeArray = payload['type_array'] || {};
        let typeParentArray = {};
        let parentNodeDataArray = [];

        let welcomeMessageJson = payload.welcome_message_json?.trim('"');

        // Validate welcome_message_node
        if (!welcomeMessageNode ||
            Object.keys(welcomeMessageNode).length === 0 ||
            Object.values(welcomeMessageNode).some(val => Array.isArray(val) ? val.some(v => typeof v === 'string' && v.trim() === "") : typeof val === 'string' && val.trim() === "")) {
            return {
                success: false,
                message: `The welcome message cannot be empty.`
            };
        }

        // Validate text_field_node
        if (!textFieldNodeValue ||
            Object.keys(textFieldNodeValue).length === 0 ||
            Object.values(textFieldNodeValue).some(val => Array.isArray(val) ? val.some(v => typeof v === 'string' && v.trim() === "") : typeof val === 'string' && val.trim() === "")) {
            return {
                success: false,
                message: `The text field cannot be empty.`
            };
        }

        // Check if parent node (node_1) has at least one connection with output_id = 1
        const hasParentNode = Object.values(outputId).some(value => {
            if (Array.isArray(value)) {
                return value.includes(1);
            }
            return value === 1;
        });

        if (!hasParentNode) {
            return {
                success: false,
                // message: `Parent needs to be connected. At least one node should have an output_id of 1.`
                message: `Parent needs to be connected. At least one node should be added using options button.`
            };
        }

        // Process each node in the input_type
        Object.keys(payload.input_type).forEach((keyty) => {
            // console.log("payload.input_type", keyty)
            let parentOption, parentNode;

            if (keyty === "node_1") {
                // parentOption = payload.welcome_message_node[keyty] ? welcomeMessageJson : "";
                parentOption = payload.welcome_message_node[keyty] ? payload.welcome_message_node[keyty] : "";
                parentNode = payload?.output_node[keyty] ? payload.output_node[keyty] : "";
            } else {
                parentOption = payload.text_input_node[keyty] ? payload.text_input_node[keyty] : "";
                parentNode = payload?.output_node[keyty] ? payload.output_node[keyty] : "";
            }

            // Initialize the parent node with relevant data
            typeParentArray[keyty] = {
                type: typeArray[keyty] || "",

                // Safely handle parent_option and calculate word length
                parent_option: Array.isArray(parentOption) && parentOption.length > 0 ? parentOption[0] : parentOption,
                // word_length: Array.isArray(parentOption) &&
                //     parentOption.length > 0 ?
                //     keyty === "node_1" ? parentOption.length : parentOption[0].length
                //     : parentOption?.length
                //     || 0,
                word_length: Array.isArray(parentOption) &&
                    parentOption.length > 0 ? parentOption[0].length : parentOption?.length
                || 0,

                parent_node: parentNode,
                child_array: []
            };

            // Add parent node to the array
            parentNodeDataArray.push(parentNode);

            // Check for child nodes and add them to child_array if they exist
            if (payload.output_node) {
                Object.keys(payload.output_node).forEach((keyout) => {
                    let childNode = payload?.output_node[keyout];
                    if (childNode.includes(keyty) && payload.text_input_node[keyout]) {
                        typeParentArray[keyty].child_array.push(keyout);
                    }
                });
            }
        });


        // Sort nodes in reverse order
        let sortedTypeParentArray = Object.keys(typeParentArray).sort((a, b) => b - a);

        for (let keytt of sortedTypeParentArray) {
            let valuett = typeParentArray[keytt];

            // Check if 'type' is an array and extract the first element (the actual type, e.g., 'list')
            let nodeType = Array.isArray(valuett.type) ? valuett.type[0] : valuett.type;

            // Validation: Only one incoming option allowed
            if (Array.isArray(valuett.parent_node) && valuett.parent_node.length > 1) {
                return {
                    success: false,
                    message: `Only one incoming option is accepted. Please check options for - ${valuett.parent_option}`
                };
            }

            // Validation for node_1: At least 1 sub-option or connection
            if (keytt === "node_1" && valuett.child_array.length === 0) {
                return {
                    success: false,
                    message: "Please select at least 1 sub option or connection."
                };
            }

            // Validate based on type (list, radio, text)
            if (nodeType === "list") {
                if (valuett.child_array.length > 10) {
                    return {
                        success: false,
                        message: `For list, you can enter only 10 options. Please check options for - ${valuett.parent_option}`
                    };
                }
                if (keytt === "node_1" && valuett.word_length > 1025) {
                    return {
                        success: false,
                        message: "Max length should be less than 1025 characters for welcome message."
                    };
                } else if (keytt !== "node_1" && valuett.word_length > 20) {
                    // Ensure this condition does not apply when keytt is "node_1"
                    return {
                        success: false,
                        message: `Max length should be less than or equal to 20 characters - ${valuett.parent_option}`
                    };
                }
            }

            if (nodeType === "radio") {
                if (valuett.child_array.length > 3) {
                    return {
                        success: false,
                        message: `For radio, you can enter only 3 options. Please check options for - ${valuett.parent_option}`
                    };
                }
                if (keytt === "node_1" && valuett.word_length > 1025) {
                    return {
                        success: false,
                        message: "Max length should be less than 1025 characters for welcome message."
                    };
                } else if (valuett.word_length > 20) {
                    return {
                        success: false,
                        message: `Max length should be less than or equal to 20 characters - ${valuett.parent_option}`
                    };
                }
            }

            if (nodeType === "text") {
                if (valuett.child_array.length > 1) {
                    return {
                        success: false,
                        message: `You can't enter options for text. Please check options for - ${valuett.parent_option}`
                    };
                }
                if (valuett.word_length > 4097) {
                    return {
                        success: false,
                        message: `Max length should be less than 4097 characters - ${valuett.parent_option}`
                    };
                }
            }

            // Validation: No further options for parent node of type "text"
            typeParentArray[keytt].parent_types = [];
            if (Array.isArray(valuett.parent_node)) {
                valuett.parent_node.forEach((parentNode) => {
                    typeParentArray[keytt].parent_types.push(payload.type_array[parentNode]);
                });
            }
            if (typeParentArray[keytt].parent_types.includes("text") && valuett.child_array.length > 0) {
                return {
                    success: false,
                    message: `You can't enter further options for text.`
                };
            }
        }

        return { success: true };
    };

    // Save button handler
    const handleOnSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission
        if (!chatbotName) {
            triggerAlert("info", "", "Please enter the chatbot name");
            return
        }

        // // Collect all hidden input data
        const formData = new FormData(event.target);

        // Temporary storage for collected form values
        const temporaryData = {};
        const welcomeMessageJson = {};

        formData.forEach((value, key) => {
            const [field, nodeId] = key.split('[');
            const cleanedNodeId = nodeId ? nodeId.replace(']', '') : '';

            if (!temporaryData[field]) {
                temporaryData[field] = {};
            }

            if (cleanedNodeId) {
                if (!temporaryData[field][cleanedNodeId]) {
                    temporaryData[field][cleanedNodeId] = [];
                }

                // Convert values to integers if required (e.g., for `output_id`, `input_id`, `pos_x`, `pos_y`)
                if (['output_id', 'input_id', 'pos_x', 'pos_y'].includes(field)) {
                    const numericValue = !isNaN(value) ? Number(value) : value;
                    temporaryData[field][cleanedNodeId].push(numericValue);
                } else {
                    temporaryData[field][cleanedNodeId].push(value);
                }
                // Check if it's a welcome_message_node and store its JSON string
                if (field === 'welcome_message_node') {
                    welcomeMessageJson[cleanedNodeId] = value;  // Collect the message to be stringified later
                }
            } else {
                temporaryData[field][''] = [value];
            }
        });

        temporaryData.welcome_message_json = JSON.stringify(welcomeMessageJson);


        // console.log('temporaryData:', temporaryData);
        const validationResult = validatePayload(temporaryData);

        // Validate the text input based on type_array rules and check welcome_message_node

        if (validationResult.success) {
            // alert("validation passed")
            // return
            // Construct the final payload if validation passes
            setIsLoading(true);
            try {
                const transformedPayload = {
                    chat_bot_name: temporaryData.chat_bot_name[""][0],
                    welcome_message_select_type: messageType ? messageType : '', // Adjust if dynamically populated
                    welcome_message_node: {
                        node_1: temporaryData.welcome_message_node?.node_1?.[0] || ""
                    },
                    text_field_node: {
                        node_1: temporaryData.text_field_node?.node_1?.[0] || ""
                    },
                    type_array: Object.keys(temporaryData.type_array)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.type_array[nodeId][0];
                        return acc;
                    }, {}),
                    pos_x: Object.keys(temporaryData.pos_x)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.pos_x[nodeId][0];
                        return acc;
                    }, {}),
                    pos_y: Object.keys(temporaryData.pos_y)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.pos_y[nodeId][0];
                        return acc;
                    }, {}),
                    input_type: Object.keys(temporaryData.input_type)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.input_type[nodeId][0];
                        return acc;
                    }, {}),
                    text_input_node: Object.keys(temporaryData.text_input_node)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.text_input_node[nodeId][0];
                        return acc;
                    }, {}),
                    output_id: Object.keys(temporaryData.output_id)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.output_id[nodeId];
                        return acc;
                    }, {}),
                    input_id: Object.keys(temporaryData.input_id)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.input_id[nodeId];
                        return acc;
                    }, {}),
                    output_class: Object.keys(temporaryData.output_class)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.output_class[nodeId];
                        return acc;
                    }, {}),
                    input_class: Object.keys(temporaryData.input_class)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.input_class[nodeId];
                        return acc;
                    }, {}),
                    output_node: Object.keys(temporaryData.output_node)?.reduce((acc, nodeId) => {
                        acc[nodeId] = temporaryData.output_node[nodeId];
                        return acc;
                    }, {}),
                    welcome_message_json: temporaryData.welcome_message_json,  // Adjust dynamically if required

                };
                if (messageType == "text") transformedPayload.header_text = headerText ? headerText : "";
                else transformedPayload.header_file = headerFile ? headerFile : null;
                const response = await createWAChatbot(transformedPayload);
                const response_data = response.data;

                if (response_data.error_code === 201) {
                    const items = response_data.results.data;
                    handleBackButton();
                    triggerAlert('success', 'success', 'Chatbot created successfully!!');
                } else {
                    setIsLoading(false);
                    triggerAlert('error', 'Oops...', 'Something went wrong!');
                }
            } catch (error) {
                const response_data = error?.response?.data
                setIsLoading(false);
                triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
            }
        }
        else {
            triggerAlert("info", "", validationResult.message)
        }
    };


    const insertTextAtCursor = (text) => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end, textarea.value.length);
        const newText = textBefore + text + textAfter;

        setWelcomeMessage(newText);

        // Set cursor after the inserted text
        setTimeout(() => {
            textarea.selectionStart = start + text.length;
            textarea.selectionEnd = start + text.length;
            textarea.focus();
        }, 0);
    };

    const applyBold = () => {
        const textarea = textareaRef.current;
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        insertTextAtCursor(`*${selectedText}*`);
    };

    const applyItalic = () => {
        const textarea = textareaRef.current;
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        insertTextAtCursor(`_${selectedText}_`);
    };

    const applyStrikethrough = () => {
        const textarea = textareaRef.current;
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        insertTextAtCursor(`~${selectedText}~`);
    };

    const applyBulletList = () => {
        const textarea = textareaRef.current;
        const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);

        // Check if the selected text already contains bullet points
        if (selectedText.includes('• ')) {
            const newText = selectedText.replace(/• /g, '');
            insertTextAtCursor(newText);
        } else {
            const newText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
            insertTextAtCursor(newText);
        }
    };

    const handleWelcomeMessageSave = () => {
        handleModalClose();

        if (!messageType) {
            triggerAlert(
                'info',
                '',
                'Please select type',
            );
            return false;
        }

        if (messageType === 'text') {
            handleModalClose();
            if (headerText === '') {
                triggerAlert(
                    'info',
                    '',
                    'Please enter header text',
                );
                return false;
            }
        } else {
            if (!headerFile) {
                handleModalClose();
                triggerAlert(
                    'info',
                    '',
                    'Please select a file',

                );
                return false;
            }
        }

        if (welcomeMessage === '') {
            handleModalClose();
            triggerAlert(
                'info',
                '',
                'Please enter body content',

            );

            return false;
        }

        // Save the welcome message logic here
        // console.log({
        //     messageType,
        //     headerText,
        //     headerFile,
        //     welcomeMessage
        // });
        handleModalClose();
        // triggerAlert('success', 'Success!', 'Welcome message saved successfully.',);
        // Find the rendered welcome_message_node textarea and update its value
        const textarea = document.getElementById('welcome_message_node');
        if (textarea) {
            textarea.value = welcomeMessage; // Update textarea with the state value
        }
    }
    return (
        <main class="main-content mt-3 mb-4">

            <div class="container content-inner" id="page_layout">

                <PageTitle heading={heading} onPrimaryClick={handleBackButton} showPrimaryButton={"Back"} />
                <div class="row w-100">
                    <div class="col-md-12">
                        <div class="tab-content" id="myTabContent">
                            <div class="card tab-pane mb-0 fade show active" id="user-content-101" role="tabpanel">

                                {/* <div class="chat-head">
                                    <header class="d-flex justify-content-between align-items-center bg-white pt-3  ps-3 pe-3 pb-3 border-bottom rounded-top">
                                        <div class="d-flex align-items-center">
                                            <div class="position-relative">
                                                <span class="badge badge-pill bg-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">A</span>
                                            </div>
                                            <div class="d-flex align-items-center w-100 iq-userlist-data">
                                                <div class="d-flex flex-grow-1 flex-column">
                                                    <div class="d-flex align-items-center h-19">
                                                        <p class="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Akash Dev</p>
                                                        <a href="#/" class="btn btn-icon btn-soft-success btn-sm ms-3 rounded-pill" data-bs-toggle="modal" data-bs-target="#exampleModalCenter-view">
                                                            <span class="btn-inner">
                                                                <i class="material-symbols-outlined md-18"> visibility</i>
                                                            </span>
                                                        </a>
                                                    </div>
                                                    <div class="d-flex align-items-center gap-2">
                                                        <small class="text-ellipsis short-1 flex-grow-1 chat-small">+91 8017988146</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="chat-header-icons d-inline-flex ms-auto">
                                            <div id="the-final-countdown" class="color-full" >
                                                <p> </p>
                                                <h5 class="text-center  time-remain">TIME REMAINING</h5>

                                            </div>
                                        </div>
                                    </header>
                                </div> */}
                                <div class="card-body">
                                    <form id="connectionForm" className='row' onSubmit={handleOnSubmit} style={{ height: '100%' }}>
                                        <div class="col-md-2">
                                            <div class="row btnsd">
                                                <button type="button" class="btn btn-warning m-2" id="clear_to_chat" onClick={handleClear}>Clear</button>

                                                <button type="submit" class="btn btn-success m-2" id="add_to_chat">Save</button>
                                            </div>
                                            <ul class="list-group new-list-group">

                                                <li class="list-group-item">
                                                    <div class="drag-drawflow" draggable onDragStart={handleDrag} data-node="options">
                                                        <span> Options</span>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        {/* <div class="col-md-2">
                                            <aside class="sidebar-chat sidebar-base border-end shadow-none  rounded-2" data-sidebar="responsive">

                                                <div class="sidebar-body pt-0 data-scrollbar chat-group mb-5 pb-5 pe-2">
                                                    <ul class="nav navbar-nav iq-main-menu  mt-3" id="sidebar-menu" role="tablist">
                                                        <button
                                                            type="button"
                                                            className="btn btn-warning rounded-pill"
                                                            onClick={handleClear}
                                                        >
                                                            Clear
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-success rounded-pill"
                                                        >
                                                            Save
                                                        </button>
                                                        <div
                                                            type="button"
                                                            className="btn btn-info rounded-pill drag-drawflow"
                                                            data-node="options"
                                                            draggable
                                                            onDragStart={handleDrag}
                                                        >
                                                            options
                                                        </div>

                                                    </ul>
                                                </div>
                                            </aside>
                                        </div> */}
                                        <div class="col-md-10">
                                            <div class="row ">
                                                <div class="form-group col-md-12 d-flex m-2">
                                                    <label for="uname" class="col-sm-3 col-form-label">Chatbot name<span className='text-danger'>*</span></label>

                                                    <div class="col-sm-8">
                                                        <input type="text" class="form-control" id="chat_bot_name" placeholder="Chatbot name" name="chat_bot_name" required=""
                                                            onChange={(e) => setChatbotName(e.target.value)} />
                                                    </div>
                                                </div>


                                            </div>
                                            <div className='row draw_wrapper'>
                                                <div id="drawflow"
                                                    ref={drawflowRef}
                                                    onDrop={handleDrop}
                                                    onDragOver={allowDrop}
                                                // style={{ border: "1px solid red" }}
                                                >
                                                    <div class="bar-zoom">
                                                        {/* <i class="fas fa-search-minus" onClick={handleZoomOut}></i>
                                                        <i class="fas fa-search" onClick={handleZoomReset}></i>
                                                        <i class="fas fa-search-plus" onClick={handleZoomIn}></i><i class=""></i> */}

                                                        <span class="material-symbols-outlined fs-2 fw-semibold" onClick={handleZoomOut}>
                                                            zoom_out
                                                        </span>

                                                        <span class="material-symbols-outlined fs-2 fw-semibold" onClick={handleZoomReset}>
                                                            search
                                                        </span>
                                                        <span class="material-symbols-outlined fs-2 fw-semibold" onClick={handleZoomIn}>
                                                            zoom_in
                                                        </span>
                                                    </div>
                                                </div>

                                                <div id="node-connections" ref={nodeConnectionsRef}></div> {/* Container for hidden inputs */}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Modal for welcome message */}
                <Modal show={showModal} onHide={handleModalClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Welcome Message</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className='row'>
                            <div >
                                <select
                                    class="form-select"
                                    value={messageType}
                                    onChange={(e) => setMessageType(e.target.value)}
                                >
                                    <option value="" hidden>Select Type</option>
                                    <option value="text" selected>Text</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                </select>
                            </div>

                            {messageType == "text" ?

                                <div controlId="headerText" className="d-flex align-items-end flex-column mt-3">
                                    <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Enter header text"
                                        value={headerText}
                                        onChange={(e) => setHeaderText(e.target.value)}
                                        maxlength="60"
                                    />
                                    <span>{headerText ? headerText?.length : 0} / 60</span>
                                </div>
                                :
                                <div controlId="show_files" className="mt-3">
                                    <input
                                        type="file" class="form-control" id="header_file" name="header_file" onChange={handleHeaderFile}
                                    />
                                </div>

                            }

                            <div controlId="welcomeMessage" className="d-flex align-items-end flex-column mt-3">
                                <textarea
                                    rows={7}
                                    ref={textareaRef}
                                    maxlength="1024"
                                    class="form-control"
                                    placeholder="Enter welcome message or body message"
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                />
                                <span>{welcomeMessage ? welcomeMessage?.length : 0} / 1024</span>
                            </div>
                            <div className='d-flex mt-2 col-md-6 justify-content-evenly align-items-center'>
                                <span type="button" className="btn btn-secondary" title='Bold' onClick={applyBold}>B</span>
                                <span type="button" className="btn btn-secondary" title='Italic' onClick={applyItalic}>I</span>
                                <span type="button" className="btn btn-secondary" title='Strike' onClick={applyStrikethrough}><s>S</s></span>
                                <span type="button" className="btn btn-secondary" title='Bulleted List' onClick={applyBulletList}>Bulleted</span>
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className='btn btn-warning' onClick={handleModalClose}>
                            Close
                        </button>
                        <button className='btn btn-primary'
                            onClick={handleWelcomeMessageSave}
                        >
                            Save Changes
                        </button>
                    </Modal.Footer>
                </Modal>
            </div >
        </main >
    )
}
