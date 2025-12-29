import React from 'react'

export default function Telegram_Permissions() {
    return (
        <div>
            <div>
                <div class="modal fade" id="exampleModalCenter-send" tabindex="-1" aria-labelledby="exampleModalCenterTitle" style={{ display: 'none' }} aria-hidden="true">
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
                                                <label class="form-label mb-2" for="t_name">Select Users<span class="text-danger ">*</span></label>
                                                <div class="dropdown" data-control="checkbox-dropdown">
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
                                                <div class="d-flex d-flex justify-content-between align-items-center mb-3">
                                                    <h6>Share </h6>
                                                    <p class="mb-0">
                                                        <a href="javascript:void(0);" class="d-flex align-items-center"><span class="me-2 fw-bold">Create an Invite Link</span>
                                                            <span class="material-symbols-outlined fs-2 fw-bold">
                                                                share
                                                            </span>
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="form-group  mb-3">
                                                <label class="form-label mb-2" for="t_name">Administration </label>
                                                <div class="dropdown" data-control="checkbox-dropdown">
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
                                        </form>
                                    </div>

                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary px-5">Save</button>
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
                            <div class="d-flex align-items-center justify-content-between flex-wrap mb-1">
                                <h4 class="fw-bold text-primary">Telegram User Permissions</h4>
                                <div class="d-flex align-items-center">
                                    <a type="button" class="btn btn-primary ms-2 d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#exampleModalCenter-send">
                                        <span class="ms-2">Create New</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-5">
                            <p>List of users who the Platform access, Kindly allow them telegram permission as well</p>
                            <div class="col-sm-12">
                                <div class="card">
                                    <div class="card-body ">
                                        <div class="table-responsive">
                                            <table id="example" class="table table-striped table-bordered hover" cellspacing="0" width="100%">
                                                <thead>
                                                    <tr>
                                                        <th>Name / ID</th>
                                                        <th>Role/Email </th>
                                                        <th>Status</th>
                                                        <th>Permissions</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td><span class="fw-bold">Kehar</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td>
                                                            <span class="fw-bold">Admin</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td class="align-middle"><span class="badge bg-success border-radius  rounded-pill w-50">Active</span></td>
                                                        <td class="align-middle"><a href="telegram_community_permissions.php"><span class="badge bg-warning border-radius  rounded-pill w-50">Permissions</span></a></td>
                                                        <td class="align-middle">
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
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
                                                        <td><span class="fw-bold">Kehar</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td>
                                                            <span class="fw-bold">Admin</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td class="align-middle"><span class="badge bg-success border-radius  rounded-pill w-50">Active</span></td>
                                                        <td class="align-middle"><a href=""><span class="badge bg-warning border-radius  rounded-pill w-50">Permissions</span></a></td>
                                                        <td class="align-middle">
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
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
                                                        <td><span class="fw-bold">Kehar</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td>
                                                            <span class="fw-bold">Admin</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td class="align-middle"><span class="badge bg-success border-radius  rounded-pill w-50">Active</span></td>
                                                        <td class="align-middle"><a href=""><span class="badge bg-warning border-radius  rounded-pill w-50">Permissions</span></a></td>
                                                        <td class="align-middle">
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
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
                                                        <td><span class="fw-bold">Kehar</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td>
                                                            <span class="fw-bold">Admin</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td class="align-middle"><span class="badge bg-success border-radius  rounded-pill w-50">Active</span></td>
                                                        <td class="align-middle"><a href=""><span class="badge bg-warning border-radius  rounded-pill w-50">Permissions</span></a></td>
                                                        <td class="align-middle">
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
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
                                                        <td><span class="fw-bold">Kehar</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td>
                                                            <span class="fw-bold">Admin</span><br />
                                                            <span >Kehar@gmail.com</span>
                                                        </td>
                                                        <td class="align-middle"><span class="badge bg-success border-radius  rounded-pill w-50">Active</span></td>
                                                        <td class="align-middle"><a href=""><span class="badge bg-warning border-radius  rounded-pill w-50">Permissions</span></a></td>
                                                        <td class="align-middle">
                                                            <div class="card-header-toolbar d-flex align-items-center">
                                                                <div class="dropdown">
                                                                    <div class="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                        <span class="material-symbols-outlined">
                                                                            more_vert
                                                                        </span>
                                                                    </div>
                                                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
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
        </div>
    )
}
