import React from 'react'

export default function Communties() {
    return (
        <div>
            <div>
                <div class="modal fade" id="exampleModalCenter-send" tabindex="-1" aria-labelledby="exampleModalCenterTitle" style={{ splay: 'none' }} ia-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalCenterTitle">Create New Community </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-12">
                                        <form>
                                            <div class="form-group  mb-2">
                                                <label class="form-label mb-2" for="t_name">Community Name<span class="text-danger ">*</span></label>
                                                <input type="text" class="form-control" id=" " placeholder="Enter Community name" />
                                            </div>
                                            <div class="form-group  mb-3">
                                                <label class="form-label mb-2" for="t_name">Description<span class="text-danger ">*</span></label>
                                                <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                                            </div>
                                            <div class="form-group  mb-3">
                                                <label class="form-label mb-2" for="t_name">Select Users<span class="text-danger ">*</span> (for community you want to add in the community)</label>
                                                <div class="dropdown new-dropdown" data-control="checkbox-dropdown">
                                                    <label class="dropdown-label">Select Users</label>
                                                    <div class="dropdown-list">
                                                        <label class="dropdown-option">
                                                            <input type="checkbox" name="dropdown-group" value="check-all" />
                                                            Check All
                                                        </label>
                                                        <label class="dropdown-option">
                                                            <input type="checkbox" name="dropdown-group" value="Selection 1" />
                                                            Kehar
                                                        </label>
                                                        <label class="dropdown-option">
                                                            <input type="checkbox" name="dropdown-group" value="Selection 2" />
                                                            Nagesh
                                                        </label>
                                                        <label class="dropdown-option">
                                                            <input type="checkbox" name="dropdown-group" value="Selection 3" />
                                                            Akash
                                                        </label>
                                                        <label class="dropdown-option">
                                                            <input type="checkbox" name="dropdown-group" value="Selection 4" />
                                                            Biswal
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">

                                            </div>
                                            <div class="form-group  mb-3">
                                                <div class="form-group  mb-3">
                                                    <label class="form-label mb-0" for="t_name">Administration </label>

                                                    <p>Select users (for want to make them admin of this community)</p>
                                                    <div class="dropdown new-dropdown" data-control="checkbox-dropdown">
                                                        <label class="dropdown-label">Select Users</label>
                                                        <div class="dropdown-list">
                                                            <label class="dropdown-option">
                                                                <input type="checkbox" name="dropdown-group" value="check-all" />
                                                                Check All
                                                            </label>
                                                            <label class="dropdown-option">
                                                                <input type="checkbox" name="dropdown-group" value="Selection 1" />
                                                                Kehar
                                                            </label>
                                                            <label class="dropdown-option">
                                                                <input type="checkbox" name="dropdown-group" value="Selection 2" />
                                                                Nagesh
                                                            </label>
                                                            <label class="dropdown-option">
                                                                <input type="checkbox" name="dropdown-group" value="Selection 3" />
                                                                Akash
                                                            </label>
                                                            <label class="dropdown-option">
                                                                <input type="checkbox" name="dropdown-group" value="Selection 4" />
                                                                Biswal
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary px-5" data-bs-toggle="modal" data-bs-target="#exampleModalCenter3">Save</button>
                                <button type="button" class="btn btn-warning px-5">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="position-relative">
                </div>
                <div id="content-page" class="content-page">
                    <div class="container">
                        <div class="row mt-3">
                            <div class="d-flex align-items-center justify-content-between flex-wrap mb-4">
                                <h4 class="fw-bold text-primary">Telegram Settings Community</h4>
                                <div class="d-flex align-items-center">
                                    <a type="button" class="btn btn-primary ms-2 d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#exampleModalCenter-send">
                                        <span class="ms-2">Create New</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-5">
                            <div class="col-sm-12">
                                <div class="card">
                                    <div class="card-body ">
                                        <div class="table-responsive">
                                            <table id="example" class="table table-striped table-bordered hover" cellspacing="0" width="100%">
                                                <thead>
                                                    <tr>
                                                        <th>Community Name</th>
                                                        <th>Purpose/Description</th>
                                                        <th>Created By</th>
                                                        <th>Users</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>PSS Software</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Vitel Global This community</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>PSS Software</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Vitel Global This community</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>PSS Software</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Vitel Global This community</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>PSS Software</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Vitel Global This community</td>
                                                        <td>This community is for only PSS Dev Team</td>
                                                        <td>Praveen SIr</td>
                                                        <td>156</td>
                                                        <td>
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            visibility
                                                                        </span>View</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            edit
                                                                        </span>Edit</a>
                                                                        <a class="dropdown-item d-flex align-items-center" href="#"><span class="material-symbols-outlined me-2 md-18">
                                                                            delete
                                                                        </span>Delete</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Wrapper End-->
      <!-- offcanvas start --> */}

            <div class="modal fade" id="exampleModalCenter3" tabindex="-1" aria-labelledby="exampleModalCenterTitle" style={{ displayay: 'none' }} ria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                    <div class="modal-content">

                        <div class="modal-body text-center">
                            <img src="assets/images/successfull.png" class="mt-3" />
                            <h4 class="mt-3">New Broadcast has been scheduled successfully</h4>
                        </div>
                        <div class="modal-footer justify-content-center border-0">
                            <button type="button" class="btn btn-primary px-5" data-bs-dismiss="modal" aria-label="Close">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
